import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import {
  KONDISI_KENDARAAN,
  STATUS_KENDARAAN,
} from '../../common/constants/domain.constants.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import { todayDateOnly, toDateOnly } from '../../common/utils/date.util.js';
import {
  normalizeNopol,
  trimNullableString,
} from '../../common/utils/normalize.util.js';
import { toPaginatedResult } from '../../common/utils/pagination.util.js';
import { Pd } from '../pd/entities/pd.entity.js';
import { PenugasanKendaraan } from '../penugasan/entities/penugasan-kendaraan.entity.js';
import { RiwayatKondisi } from '../riwayat-kondisi/entities/riwayat-kondisi.entity.js';
import { CreateKendaraanDto } from './dto/create-kendaraan.dto.js';
import { QueryKendaraanDto } from './dto/query-kendaraan.dto.js';
import { StatistikKendaraanDto } from './dto/statistik-kendaraan.dto.js';
import { UpdateKendaraanDto } from './dto/update-kendaraan.dto.js';
import { Kendaraan } from './entities/kendaraan.entity.js';

@Injectable()
export class KendaraanService {
  constructor(
    @InjectRepository(Kendaraan)
    private readonly kendaraanRepository: Repository<Kendaraan>,
    @InjectRepository(Pd)
    private readonly pdRepository: Repository<Pd>,
    @InjectRepository(PenugasanKendaraan)
    private readonly penugasanRepository: Repository<PenugasanKendaraan>,
    @InjectRepository(RiwayatKondisi)
    private readonly riwayatRepository: Repository<RiwayatKondisi>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateKendaraanDto): Promise<Kendaraan> {
    const nopol = normalizeNopol(dto.nopol);
    await this.ensureUnique(nopol, dto.nomorRangka, dto.nomorMesin);

    if (dto.pdId !== undefined) {
      await this.ensurePdExists(dto.pdId);
    }

    const kondisi = dto.kondisi ?? 'BAIK';
    const status =
      dto.status ?? (kondisi === 'DALAM_PERBAIKAN' ? 'PERBAIKAN' : 'TERSEDIA');

    const savedId = await this.dataSource.transaction(async (manager) => {
      const kendaraanRepository = manager.getRepository(Kendaraan);
      const riwayatRepository = manager.getRepository(RiwayatKondisi);

      const entity = kendaraanRepository.create({
        nopol,
        merek: dto.merek.trim(),
        tipe: dto.tipe.trim(),
        tahun: dto.tahun,
        warna: dto.warna.trim(),
        kondisi,
        status,
        nomorRangka: trimNullableString(dto.nomorRangka),
        nomorMesin: trimNullableString(dto.nomorMesin),
        odometer: dto.odometer ?? 0,
        tanggalPajak: toDateOnly(dto.tanggalPajak),
        catatan: trimNullableString(dto.catatan),
        pdId: dto.pdId ?? null,
      });

      const saved = await kendaraanRepository.save(entity);

      await riwayatRepository.save(
        riwayatRepository.create({
          kendaraanId: saved.id,
          kondisi: saved.kondisi,
          tanggal: todayDateOnly(),
          keterangan: 'Kondisi awal saat kendaraan didaftarkan.',
          dicatatOleh: null,
        }),
      );

      return saved.id;
    });

    return this.findOne(savedId);
  }

  async findAll(query: QueryKendaraanDto): Promise<PaginatedResult<Kendaraan>> {
    const {
      page,
      limit,
      search,
      kondisi,
      status,
      pdId,
      tahun,
      sortBy,
      sortOrder,
    } = query;
    const qb = this.kendaraanRepository
      .createQueryBuilder('kendaraan')
      .leftJoinAndSelect('kendaraan.pd', 'pd');

    if (search) {
      qb.andWhere(
        `(LOWER(kendaraan.nopol) LIKE :search
          OR LOWER(kendaraan.merek) LIKE :search
          OR LOWER(kendaraan.tipe) LIKE :search
          OR LOWER(kendaraan.warna) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (kondisi !== undefined) {
      qb.andWhere('kendaraan.kondisi = :kondisi', { kondisi });
    }

    if (status !== undefined) {
      qb.andWhere('kendaraan.status = :status', { status });
    }

    if (pdId !== undefined) {
      qb.andWhere('kendaraan.pdId = :pdId', { pdId });
    }

    if (tahun !== undefined) {
      qb.andWhere('kendaraan.tahun = :tahun', { tahun });
    }

    qb.orderBy(`kendaraan.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('kendaraan.id', sortOrder === 'asc' ? 'ASC' : 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number): Promise<Kendaraan> {
    const entity = await this.kendaraanRepository.findOne({
      where: { id },
      relations: { pd: true },
    });

    if (!entity) {
      throw new NotFoundException(`Kendaraan dengan id ${id} tidak ditemukan.`);
    }

    const [penugasanAktif, riwayatKondisiTerbaru] = await Promise.all([
      this.penugasanRepository.findOne({
        where: { kendaraanId: id, status: 'AKTIF' },
        relations: { pns: true },
        order: { tanggalMulai: 'DESC', id: 'DESC' },
      }),
      this.riwayatRepository.findOne({
        where: { kendaraanId: id },
        order: { tanggal: 'DESC', id: 'DESC' },
      }),
    ]);

    entity.penugasanAktif = penugasanAktif
      ? (penugasanAktif as unknown as Record<string, unknown>)
      : null;
    entity.riwayatKondisiTerbaru = riwayatKondisiTerbaru
      ? (riwayatKondisiTerbaru as unknown as Record<string, unknown>)
      : null;

    return entity;
  }

  async update(id: number, dto: UpdateKendaraanDto): Promise<Kendaraan> {
    const entity = await this.findOne(id);
    const previousKondisi = entity.kondisi;

    const nopol =
      dto.nopol !== undefined ? normalizeNopol(dto.nopol) : entity.nopol;

    await this.ensureUnique(
      nopol,
      dto.nomorRangka !== undefined ? dto.nomorRangka : entity.nomorRangka,
      dto.nomorMesin !== undefined ? dto.nomorMesin : entity.nomorMesin,
      id,
    );

    if (dto.pdId !== undefined) {
      await this.ensurePdExists(dto.pdId);
    }

    this.applyUpdate(entity, dto);

    await this.dataSource.transaction(async (manager) => {
      const kendaraanRepository = manager.getRepository(Kendaraan);
      const riwayatRepository = manager.getRepository(RiwayatKondisi);
      const penugasanRepository = manager.getRepository(PenugasanKendaraan);

      if (entity.kondisi !== previousKondisi) {
        if (dto.status === undefined) {
          await this.deriveStatusFromCondition(entity, penugasanRepository);
        }

        await riwayatRepository.save(
          riwayatRepository.create({
            kendaraanId: entity.id,
            kondisi: entity.kondisi,
            tanggal: todayDateOnly(),
            keterangan: `Perubahan kondisi dari ${previousKondisi} menjadi ${entity.kondisi} melalui pembaruan data kendaraan.`,
            dicatatOleh: null,
          }),
        );
      }

      await kendaraanRepository.save(entity);
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const [penugasanAktif, totalPenugasan] = await Promise.all([
      this.penugasanRepository.count({
        where: { kendaraanId: id, status: 'AKTIF' },
      }),
      this.penugasanRepository.count({ where: { kendaraanId: id } }),
    ]);

    if (penugasanAktif > 0) {
      throw new ConflictException(
        'Kendaraan tidak dapat dihapus karena masih memiliki penugasan aktif. Selesaikan penugasan terlebih dahulu.',
      );
    }

    if (totalPenugasan > 0) {
      throw new ConflictException(
        'Kendaraan tidak dapat dihapus karena memiliki riwayat penugasan. Nonaktifkan kendaraan (status NONAKTIF) untuk mempertahankan riwayat.',
      );
    }

    const result = await this.kendaraanRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Kendaraan dengan id ${id} tidak ditemukan.`);
    }
  }

  async statistik(): Promise<StatistikKendaraanDto> {
    const rows = await this.kendaraanRepository.find({
      select: { kondisi: true, status: true, tanggalPajak: true },
    });

    const byKondisi: Record<string, number> = Object.fromEntries(
      KONDISI_KENDARAAN.map((kondisi) => [kondisi, 0]),
    );
    const byStatus: Record<string, number> = Object.fromEntries(
      STATUS_KENDARAAN.map((status) => [status, 0]),
    );

    const today = todayDateOnly();
    let perluPerhatian = 0;
    let pajakKedaluwarsa = 0;

    for (const row of rows) {
      byKondisi[row.kondisi] = (byKondisi[row.kondisi] ?? 0) + 1;
      byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;

      if (row.kondisi !== 'BAIK') {
        perluPerhatian += 1;
      }

      if (row.tanggalPajak && row.tanggalPajak < today) {
        pajakKedaluwarsa += 1;
      }
    }

    return {
      total: rows.length,
      byKondisi,
      byStatus,
      perluPerhatian,
      pajakKedaluwarsa,
    };
  }

  private applyUpdate(entity: Kendaraan, dto: UpdateKendaraanDto): void {
    if (dto.nopol !== undefined) {
      entity.nopol = normalizeNopol(dto.nopol);
    }

    if (dto.merek !== undefined) {
      entity.merek = dto.merek.trim();
    }

    if (dto.tipe !== undefined) {
      entity.tipe = dto.tipe.trim();
    }

    if (dto.tahun !== undefined) {
      entity.tahun = dto.tahun;
    }

    if (dto.warna !== undefined) {
      entity.warna = dto.warna.trim();
    }

    if (dto.kondisi !== undefined) {
      entity.kondisi = dto.kondisi;
    }

    if (dto.status !== undefined) {
      entity.status = dto.status;
    }

    if (dto.nomorRangka !== undefined) {
      entity.nomorRangka = trimNullableString(dto.nomorRangka);
    }

    if (dto.nomorMesin !== undefined) {
      entity.nomorMesin = trimNullableString(dto.nomorMesin);
    }

    if (dto.odometer !== undefined) {
      entity.odometer = dto.odometer;
    }

    if (dto.tanggalPajak !== undefined) {
      entity.tanggalPajak = toDateOnly(dto.tanggalPajak);
    }

    if (dto.catatan !== undefined) {
      entity.catatan = trimNullableString(dto.catatan);
    }

    if (dto.pdId !== undefined) {
      entity.pdId = dto.pdId;
    }
  }

  private async deriveStatusFromCondition(
    entity: Kendaraan,
    penugasanRepository: Repository<PenugasanKendaraan>,
  ): Promise<void> {
    if (entity.status === 'NONAKTIF') {
      return;
    }

    if (entity.kondisi === 'DALAM_PERBAIKAN') {
      entity.status = 'PERBAIKAN';
      return;
    }

    if (entity.status === 'PERBAIKAN') {
      const activeCount = await penugasanRepository.count({
        where: { kendaraanId: entity.id, status: 'AKTIF' },
      });
      entity.status = activeCount > 0 ? 'DIGUNAKAN' : 'TERSEDIA';
    }
  }

  private async ensureUnique(
    nopol: string,
    nomorRangka: string | null | undefined,
    nomorMesin: string | null | undefined,
    excludeId?: number,
  ): Promise<void> {
    const exclude = excludeId ? { id: Not(excludeId) } : {};

    const duplicateNopol = await this.kendaraanRepository.findOne({
      where: { nopol, ...exclude },
    });

    if (duplicateNopol) {
      throw new ConflictException(
        `Kendaraan dengan nopol "${nopol}" sudah terdaftar.`,
      );
    }

    const rangka = trimNullableString(nomorRangka);
    if (rangka) {
      const duplicateRangka = await this.kendaraanRepository.findOne({
        where: { nomorRangka: rangka, ...exclude },
      });

      if (duplicateRangka) {
        throw new ConflictException(
          `Kendaraan dengan nomor rangka "${rangka}" sudah terdaftar.`,
        );
      }
    }

    const mesin = trimNullableString(nomorMesin);
    if (mesin) {
      const duplicateMesin = await this.kendaraanRepository.findOne({
        where: { nomorMesin: mesin, ...exclude },
      });

      if (duplicateMesin) {
        throw new ConflictException(
          `Kendaraan dengan nomor mesin "${mesin}" sudah terdaftar.`,
        );
      }
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
