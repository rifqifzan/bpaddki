import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import {
  normalizeEmail,
  trimNullableString,
} from '../../common/utils/normalize.util.js';
import { toPaginatedResult } from '../../common/utils/pagination.util.js';
import { PenugasanKendaraan } from '../penugasan/entities/penugasan-kendaraan.entity.js';
import { Pd } from '../pd/entities/pd.entity.js';
import { CreatePnsDto } from './dto/create-pns.dto.js';
import { QueryPnsDto } from './dto/query-pns.dto.js';
import { UpdatePnsDto } from './dto/update-pns.dto.js';
import { Pns } from './entities/pns.entity.js';

@Injectable()
export class PnsService {
  constructor(
    @InjectRepository(Pns)
    private readonly pnsRepository: Repository<Pns>,
    @InjectRepository(Pd)
    private readonly pdRepository: Repository<Pd>,
    @InjectRepository(PenugasanKendaraan)
    private readonly penugasanRepository: Repository<PenugasanKendaraan>,
  ) {}

  async create(dto: CreatePnsDto): Promise<Pns> {
    await this.ensurePdExists(dto.pdId);

    const nip = dto.nip.trim();
    if (await this.pnsRepository.exists({ where: { nip } })) {
      throw new ConflictException(`PNS dengan NIP "${nip}" sudah terdaftar.`);
    }

    const email = dto.email ? normalizeEmail(dto.email) : null;
    if (email && (await this.pnsRepository.exists({ where: { email } }))) {
      throw new ConflictException(
        `PNS dengan email "${email}" sudah terdaftar.`,
      );
    }

    const entity = this.pnsRepository.create({
      nama: dto.nama.trim(),
      nip,
      jabatan: dto.jabatan.trim(),
      golongan: dto.golongan,
      email,
      telepon: trimNullableString(dto.telepon),
      aktif: dto.aktif ?? true,
      pdId: dto.pdId,
    });

    return this.pnsRepository.save(entity);
  }

  async findAll(query: QueryPnsDto): Promise<PaginatedResult<Pns>> {
    const { page, limit, search, pdId, golongan, aktif, sortBy, sortOrder } =
      query;
    const qb = this.pnsRepository
      .createQueryBuilder('pns')
      .leftJoinAndSelect('pns.pd', 'pd');

    if (search) {
      qb.andWhere(
        `(LOWER(pns.nama) LIKE :search
          OR pns.nip LIKE :search
          OR LOWER(pns.jabatan) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (pdId !== undefined) {
      qb.andWhere('pns.pdId = :pdId', { pdId });
    }

    if (golongan !== undefined) {
      qb.andWhere('pns.golongan = :golongan', { golongan });
    }

    if (aktif !== undefined) {
      qb.andWhere('pns.aktif = :aktif', { aktif });
    }

    qb.orderBy(`pns.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('pns.id', sortOrder === 'asc' ? 'ASC' : 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number): Promise<Pns> {
    const entity = await this.pnsRepository.findOne({
      where: { id },
      relations: { pd: true },
    });

    if (!entity) {
      throw new NotFoundException(`PNS dengan id ${id} tidak ditemukan.`);
    }

    return entity;
  }

  async update(id: number, dto: UpdatePnsDto): Promise<Pns> {
    const entity = await this.findOne(id);

    if (dto.pdId !== undefined && dto.pdId !== entity.pdId) {
      await this.ensurePdExists(dto.pdId);
      entity.pdId = dto.pdId;
    }

    if (dto.nip !== undefined) {
      const nip = dto.nip.trim();
      const duplicate = await this.pnsRepository.findOne({
        where: { nip, id: Not(id) },
      });

      if (duplicate) {
        throw new ConflictException(`PNS dengan NIP "${nip}" sudah terdaftar.`);
      }

      entity.nip = nip;
    }

    if (dto.email !== undefined) {
      const email = dto.email ? normalizeEmail(dto.email) : null;

      if (email) {
        const duplicate = await this.pnsRepository.findOne({
          where: { email, id: Not(id) },
        });

        if (duplicate) {
          throw new ConflictException(
            `PNS dengan email "${email}" sudah terdaftar.`,
          );
        }
      }

      entity.email = email;
    }

    if (dto.nama !== undefined) {
      entity.nama = dto.nama.trim();
    }

    if (dto.jabatan !== undefined) {
      entity.jabatan = dto.jabatan.trim();
    }

    if (dto.golongan !== undefined) {
      entity.golongan = dto.golongan;
    }

    if (dto.telepon !== undefined) {
      entity.telepon = trimNullableString(dto.telepon);
    }

    if (dto.aktif !== undefined) {
      entity.aktif = dto.aktif;
    }

    await this.pnsRepository.save(entity);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const jumlahPenugasan = await this.penugasanRepository.count({
      where: { pnsId: id },
    });

    if (jumlahPenugasan > 0) {
      throw new ConflictException(
        `PNS tidak dapat dihapus karena memiliki ${jumlahPenugasan} riwayat penugasan kendaraan. Nonaktifkan PNS ini (aktif=false) untuk mempertahankan riwayat.`,
      );
    }

    const result = await this.pnsRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`PNS dengan id ${id} tidak ditemukan.`);
    }
  }

  private async ensurePdExists(pdId: number): Promise<void> {
    const exists = await this.pdRepository.exists({ where: { id: pdId } });

    if (!exists) {
      throw new NotFoundException(
        `Perangkat Daerah dengan id ${pdId} tidak ditemukan.`,
      );
    }
  }
}
