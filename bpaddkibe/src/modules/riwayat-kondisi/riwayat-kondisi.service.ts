import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import { todayDateOnly, toDateOnly } from '../../common/utils/date.util.js';
import { trimNullableString } from '../../common/utils/normalize.util.js';
import { toPaginatedResult } from '../../common/utils/pagination.util.js';
import { Kendaraan } from '../kendaraan/entities/kendaraan.entity.js';
import { PenugasanKendaraan } from '../penugasan/entities/penugasan-kendaraan.entity.js';
import { CreateRiwayatKondisiDto } from './dto/create-riwayat-kondisi.dto.js';
import { QueryRiwayatKondisiDto } from './dto/query-riwayat-kondisi.dto.js';
import { RiwayatKondisi } from './entities/riwayat-kondisi.entity.js';

@Injectable()
export class RiwayatKondisiService {
  constructor(
    @InjectRepository(RiwayatKondisi)
    private readonly riwayatRepository: Repository<RiwayatKondisi>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    kendaraanId: number,
    dto: CreateRiwayatKondisiDto,
  ): Promise<RiwayatKondisi> {
    return this.dataSource.transaction(async (manager) => {
      const kendaraanRepository = manager.getRepository(Kendaraan);
      const penugasanRepository = manager.getRepository(PenugasanKendaraan);
      const riwayatRepository = manager.getRepository(RiwayatKondisi);

      const kendaraan = await kendaraanRepository.findOneBy({
        id: kendaraanId,
      });

      if (!kendaraan) {
        throw new NotFoundException(
          `Kendaraan dengan id ${kendaraanId} tidak ditemukan.`,
        );
      }

      const riwayat = riwayatRepository.create({
        kendaraanId,
        kondisi: dto.kondisi,
        tanggal: toDateOnly(dto.tanggal) ?? todayDateOnly(),
        keterangan: trimNullableString(dto.keterangan),
        dicatatOleh: trimNullableString(dto.dicatatOleh),
      });

      const saved = await riwayatRepository.save(riwayat);

      kendaraan.kondisi = dto.kondisi;

      if (kendaraan.status !== 'NONAKTIF') {
        if (dto.kondisi === 'DALAM_PERBAIKAN') {
          kendaraan.status = 'PERBAIKAN';
        } else if (kendaraan.status === 'PERBAIKAN') {
          const activeCount = await penugasanRepository.count({
            where: { kendaraanId, status: 'AKTIF' },
          });
          kendaraan.status = activeCount > 0 ? 'DIGUNAKAN' : 'TERSEDIA';
        }
      }

      await kendaraanRepository.save(kendaraan);
      saved.kendaraan = kendaraan;

      return saved;
    });
  }

  async findAll(
    query: QueryRiwayatKondisiDto,
    kendaraanId?: number,
  ): Promise<PaginatedResult<RiwayatKondisi>> {
    const { page, limit, search, kondisi, from, to, sortBy, sortOrder } = query;
    const qb = this.riwayatRepository
      .createQueryBuilder('riwayat')
      .leftJoinAndSelect('riwayat.kendaraan', 'kendaraan');

    const filterKendaraanId = kendaraanId ?? query.kendaraanId;

    if (filterKendaraanId !== undefined) {
      qb.andWhere('riwayat.kendaraanId = :kendaraanId', {
        kendaraanId: filterKendaraanId,
      });
    }

    if (search) {
      qb.andWhere(
        `(LOWER(COALESCE(riwayat.keterangan, '')) LIKE :search
          OR LOWER(COALESCE(riwayat.dicatatOleh, '')) LIKE :search
          OR LOWER(kendaraan.nopol) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (kondisi !== undefined) {
      qb.andWhere('riwayat.kondisi = :kondisi', { kondisi });
    }

    if (from !== undefined) {
      qb.andWhere('riwayat.tanggal >= :from', { from: toDateOnly(from) });
    }

    if (to !== undefined) {
      qb.andWhere('riwayat.tanggal <= :to', { to: toDateOnly(to) });
    }

    qb.orderBy(`riwayat.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('riwayat.id', sortOrder === 'asc' ? 'ASC' : 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number): Promise<RiwayatKondisi> {
    const entity = await this.riwayatRepository.findOne({
      where: { id },
      relations: { kendaraan: true },
    });

    if (!entity) {
      throw new NotFoundException(
        `Riwayat kondisi dengan id ${id} tidak ditemukan.`,
      );
    }

    return entity;
  }
}
