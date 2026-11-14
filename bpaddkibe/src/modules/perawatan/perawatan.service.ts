import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import { toDateOnly } from '../../common/utils/date.util.js';
import { trimNullableString } from '../../common/utils/normalize.util.js';
import { toPaginatedResult } from '../../common/utils/pagination.util.js';
import { Kendaraan } from '../kendaraan/entities/kendaraan.entity.js';
import { CreatePerawatanDto } from './dto/create-perawatan.dto.js';
import { QueryPerawatanDto } from './dto/query-perawatan.dto.js';
import { UpdatePerawatanDto } from './dto/update-perawatan.dto.js';
import { Perawatan } from './entities/perawatan.entity.js';

@Injectable()
export class PerawatanService {
  constructor(
    @InjectRepository(Perawatan)
    private readonly perawatanRepository: Repository<Perawatan>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePerawatanDto): Promise<Perawatan> {
    const id = await this.dataSource.transaction(async (manager) => {
      const kendaraanRepository = manager.getRepository(Kendaraan);
      const perawatanRepository = manager.getRepository(Perawatan);

      const kendaraan = await kendaraanRepository.findOneBy({
        id: dto.kendaraanId,
      });

      if (!kendaraan) {
        throw new NotFoundException(
          `Kendaraan dengan id ${dto.kendaraanId} tidak ditemukan.`,
        );
      }

      const entity = perawatanRepository.create({
        kendaraanId: dto.kendaraanId,
        jenis: dto.jenis,
        tanggal: toDateOnly(dto.tanggal) as string,
        deskripsi: dto.deskripsi.trim(),
        bengkel: trimNullableString(dto.bengkel),
        biaya: dto.biaya ?? 0,
        odometer: dto.odometer ?? null,
        status: dto.status ?? 'SELESAI',
      });

      const saved = await perawatanRepository.save(entity);
      await this.updateOdometer(
        kendaraanRepository,
        kendaraan,
        dto.odometer ?? null,
      );

      return saved.id;
    });

    return this.findOne(id);
  }

  async findAll(query: QueryPerawatanDto): Promise<PaginatedResult<Perawatan>> {
    const {
      page,
      limit,
      search,
      kendaraanId,
      jenis,
      status,
      from,
      to,
      sortBy,
      sortOrder,
    } = query;

    const qb = this.perawatanRepository
      .createQueryBuilder('perawatan')
      .leftJoinAndSelect('perawatan.kendaraan', 'kendaraan');

    if (search) {
      qb.andWhere(
        `(LOWER(perawatan.deskripsi) LIKE :search
          OR LOWER(COALESCE(perawatan.bengkel, '')) LIKE :search
          OR LOWER(kendaraan.nopol) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (kendaraanId !== undefined) {
      qb.andWhere('perawatan.kendaraanId = :kendaraanId', { kendaraanId });
    }

    if (jenis !== undefined) {
      qb.andWhere('perawatan.jenis = :jenis', { jenis });
    }

    if (status !== undefined) {
      qb.andWhere('perawatan.status = :status', { status });
    }

    if (from !== undefined) {
      qb.andWhere('perawatan.tanggal >= :from', { from: toDateOnly(from) });
    }

    if (to !== undefined) {
      qb.andWhere('perawatan.tanggal <= :to', { to: toDateOnly(to) });
    }

    qb.orderBy(`perawatan.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('perawatan.id', sortOrder === 'asc' ? 'ASC' : 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number): Promise<Perawatan> {
    const entity = await this.perawatanRepository.findOne({
      where: { id },
      relations: { kendaraan: true },
    });

    if (!entity) {
      throw new NotFoundException(`Perawatan dengan id ${id} tidak ditemukan.`);
    }

    return entity;
  }

  async update(id: number, dto: UpdatePerawatanDto): Promise<Perawatan> {
    await this.dataSource.transaction(async (manager) => {
      const kendaraanRepository = manager.getRepository(Kendaraan);
      const perawatanRepository = manager.getRepository(Perawatan);

      const entity = await perawatanRepository.findOneBy({ id });

      if (!entity) {
        throw new NotFoundException(
          `Perawatan dengan id ${id} tidak ditemukan.`,
        );
      }

      if (dto.jenis !== undefined) {
        entity.jenis = dto.jenis;
      }

      if (dto.tanggal !== undefined) {
        entity.tanggal = toDateOnly(dto.tanggal) as string;
      }

      if (dto.deskripsi !== undefined) {
        entity.deskripsi = dto.deskripsi.trim();
      }

      if (dto.bengkel !== undefined) {
        entity.bengkel = trimNullableString(dto.bengkel);
      }

      if (dto.biaya !== undefined) {
        entity.biaya = dto.biaya;
      }

      if (dto.odometer !== undefined) {
        entity.odometer = dto.odometer;
      }

      if (dto.status !== undefined) {
        entity.status = dto.status;
      }

      await perawatanRepository.save(entity);

      if (dto.odometer !== undefined && dto.odometer !== null) {
        const kendaraan = await kendaraanRepository.findOneBy({
          id: entity.kendaraanId,
        });

        if (kendaraan) {
          await this.updateOdometer(
            kendaraanRepository,
            kendaraan,
            dto.odometer,
          );
        }
      }
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const entity = await this.perawatanRepository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException(`Perawatan dengan id ${id} tidak ditemukan.`);
    }

    const result = await this.perawatanRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Perawatan dengan id ${id} tidak ditemukan.`);
    }
  }

  private async updateOdometer(
    kendaraanRepository: Repository<Kendaraan>,
    kendaraan: Kendaraan,
    odometer: number | null,
  ): Promise<void> {
    if (odometer === null || odometer <= kendaraan.odometer) {
      return;
    }

    kendaraan.odometer = odometer;
    await kendaraanRepository.save(kendaraan);
  }
}
