import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import {
  normalizeKode,
  trimNullableString,
} from '../../common/utils/normalize.util.js';
import { toPaginatedResult } from '../../common/utils/pagination.util.js';
import { Kendaraan } from '../kendaraan/entities/kendaraan.entity.js';
import { Pns } from '../pns/entities/pns.entity.js';
import { CreatePdDto } from './dto/create-pd.dto.js';
import { QueryPdDto } from './dto/query-pd.dto.js';
import { UpdatePdDto } from './dto/update-pd.dto.js';
import { Pd } from './entities/pd.entity.js';

@Injectable()
export class PdService {
  constructor(
    @InjectRepository(Pd)
    private readonly pdRepository: Repository<Pd>,
    @InjectRepository(Pns)
    private readonly pnsRepository: Repository<Pns>,
    @InjectRepository(Kendaraan)
    private readonly kendaraanRepository: Repository<Kendaraan>,
  ) {}

  async create(dto: CreatePdDto): Promise<Pd> {
    const kode = normalizeKode(dto.kode);

    if (await this.pdRepository.exists({ where: { kode } })) {
      throw new ConflictException(
        `Perangkat Daerah dengan kode "${kode}" sudah terdaftar.`,
      );
    }

    const entity = this.pdRepository.create({
      kode,
      nama: dto.nama.trim(),
      singkatan: trimNullableString(dto.singkatan),
      alamat: trimNullableString(dto.alamat),
      telepon: trimNullableString(dto.telepon),
      aktif: dto.aktif ?? true,
    });

    return this.pdRepository.save(entity);
  }

  async findAll(query: QueryPdDto): Promise<PaginatedResult<Pd>> {
    const { page, limit, search, aktif, sortBy, sortOrder } = query;
    const qb = this.pdRepository.createQueryBuilder('pd');

    if (search) {
      qb.andWhere(
        `(LOWER(pd.nama) LIKE :search
          OR LOWER(pd.kode) LIKE :search
          OR LOWER(COALESCE(pd.singkatan, '')) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (aktif !== undefined) {
      qb.andWhere('pd.aktif = :aktif', { aktif });
    }

    qb.orderBy(`pd.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('pd.id', sortOrder === 'asc' ? 'ASC' : 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    await this.attachCounts(data);

    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number): Promise<Pd> {
    const entity = await this.pdRepository.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException(
        `Perangkat Daerah dengan id ${id} tidak ditemukan.`,
      );
    }

    await this.attachCounts([entity]);
    return entity;
  }

  async update(id: number, dto: UpdatePdDto): Promise<Pd> {
    const entity = await this.findOne(id);

    if (dto.kode !== undefined) {
      const kode = normalizeKode(dto.kode);
      const duplicate = await this.pdRepository.findOne({
        where: { kode },
      });

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          `Perangkat Daerah dengan kode "${kode}" sudah terdaftar.`,
        );
      }

      entity.kode = kode;
    }

    if (dto.nama !== undefined) {
      entity.nama = dto.nama.trim();
    }

    if (dto.singkatan !== undefined) {
      entity.singkatan = trimNullableString(dto.singkatan);
    }

    if (dto.alamat !== undefined) {
      entity.alamat = trimNullableString(dto.alamat);
    }

    if (dto.telepon !== undefined) {
      entity.telepon = trimNullableString(dto.telepon);
    }

    if (dto.aktif !== undefined) {
      entity.aktif = dto.aktif;
    }

    const saved = await this.pdRepository.save(entity);
    await this.attachCounts([saved]);
    return saved;
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findOne(id);
    const [jumlahPns, jumlahKendaraan] = await Promise.all([
      this.pnsRepository.count({ where: { pdId: id } }),
      this.kendaraanRepository.count({ where: { pdId: id } }),
    ]);

    if (jumlahPns > 0 || jumlahKendaraan > 0) {
      throw new ConflictException(
        `Perangkat Daerah "${entity.nama}" tidak dapat dihapus karena masih memiliki ${jumlahPns} PNS dan ${jumlahKendaraan} kendaraan. Nonaktifkan PD ini jika sudah tidak digunakan.`,
      );
    }

    const result = await this.pdRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(
        `Perangkat Daerah dengan id ${id} tidak ditemukan.`,
      );
    }
  }

  private async attachCounts(items: Pd[]): Promise<void> {
    if (items.length === 0) {
      return;
    }

    const ids = items.map((item) => item.id);
    const [pnsCounts, kendaraanCounts] = await Promise.all([
      this.pnsRepository
        .createQueryBuilder('pns')
        .select('pns.pdId', 'pdId')
        .addSelect('COUNT(*)', 'count')
        .where('pns.pdId IN (:...ids)', { ids })
        .groupBy('pns.pdId')
        .getRawMany<{ pdId: number | string; count: string }>(),
      this.kendaraanRepository
        .createQueryBuilder('kendaraan')
        .select('kendaraan.pdId', 'pdId')
        .addSelect('COUNT(*)', 'count')
        .where('kendaraan.pdId IN (:...ids)', { ids })
        .groupBy('kendaraan.pdId')
        .getRawMany<{ pdId: number | string; count: string }>(),
    ]);

    const pnsMap = new Map(
      pnsCounts.map((row) => [Number(row.pdId), Number(row.count)]),
    );
    const kendaraanMap = new Map(
      kendaraanCounts.map((row) => [Number(row.pdId), Number(row.count)]),
    );

    for (const item of items) {
      item.jumlahPns = pnsMap.get(item.id) ?? 0;
      item.jumlahKendaraan = kendaraanMap.get(item.id) ?? 0;
    }
  }
}
