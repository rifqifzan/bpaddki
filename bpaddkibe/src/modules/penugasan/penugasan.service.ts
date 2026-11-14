import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import type {
  PeranPenugasan,
  StatusPenugasan,
} from '../../common/constants/domain.constants.js';
import type { PaginatedResult } from '../../common/interfaces/paginated-result.interface.js';
import {
  isDateBefore,
  todayDateOnly,
  toDateOnly,
} from '../../common/utils/date.util.js';
import { trimNullableString } from '../../common/utils/normalize.util.js';
import { toPaginatedResult } from '../../common/utils/pagination.util.js';
import { Kendaraan } from '../kendaraan/entities/kendaraan.entity.js';
import { Pns } from '../pns/entities/pns.entity.js';
import { CreatePenugasanDto } from './dto/create-penugasan.dto.js';
import { QueryPenugasanDto } from './dto/query-penugasan.dto.js';
import { UpdatePenugasanDto } from './dto/update-penugasan.dto.js';
import { PenugasanKendaraan } from './entities/penugasan-kendaraan.entity.js';

@Injectable()
export class PenugasanService {
  constructor(
    @InjectRepository(PenugasanKendaraan)
    private readonly penugasanRepository: Repository<PenugasanKendaraan>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePenugasanDto): Promise<PenugasanKendaraan> {
    const tanggalMulai = toDateOnly(dto.tanggalMulai) as string;
    const tanggalSelesai = toDateOnly(dto.tanggalSelesai);
    const status = dto.status ?? 'AKTIF';
    const peran = dto.peran ?? 'PENANGGUNG_JAWAB';

    this.validateDateRange(tanggalMulai, tanggalSelesai);

    const id = await this.dataSource.transaction(async (manager) => {
      const kendaraanRepository = manager.getRepository(Kendaraan);
      const pnsRepository = manager.getRepository(Pns);
      const penugasanRepository = manager.getRepository(PenugasanKendaraan);

      const kendaraan = await kendaraanRepository.findOneBy({
        id: dto.kendaraanId,
      });

      if (!kendaraan) {
        throw new NotFoundException(
          `Kendaraan dengan id ${dto.kendaraanId} tidak ditemukan.`,
        );
      }

      const pns = await pnsRepository.findOneBy({ id: dto.pnsId });

      if (!pns) {
        throw new NotFoundException(
          `PNS dengan id ${dto.pnsId} tidak ditemukan.`,
        );
      }

      if (!pns.aktif) {
        throw new ConflictException(
          `PNS "${pns.nama}" tidak aktif sehingga tidak dapat ditugaskan.`,
        );
      }

      if (kendaraan.status === 'NONAKTIF') {
        throw new ConflictException(
          `Kendaraan dengan nopol "${kendaraan.nopol}" berstatus NONAKTIF sehingga tidak dapat ditugaskan.`,
        );
      }

      if (status === 'AKTIF') {
        await this.ensureNoActiveConflict(
          penugasanRepository,
          kendaraan.nopol,
          pns.nama,
          dto.kendaraanId,
          dto.pnsId,
          peran,
        );
      }

      const entity = penugasanRepository.create({
        kendaraanId: dto.kendaraanId,
        pnsId: dto.pnsId,
        peran,
        tanggalMulai,
        tanggalSelesai,
        status,
        catatan: trimNullableString(dto.catatan),
      });

      const saved = await penugasanRepository.save(entity);

      if (status === 'AKTIF') {
        kendaraan.status = 'DIGUNAKAN';
        await kendaraanRepository.save(kendaraan);
      }

      return saved.id;
    });

    return this.findOne(id);
  }

  async findAll(
    query: QueryPenugasanDto,
  ): Promise<PaginatedResult<PenugasanKendaraan>> {
    const {
      page,
      limit,
      search,
      kendaraanId,
      pnsId,
      status,
      peran,
      sortBy,
      sortOrder,
    } = query;

    const qb = this.penugasanRepository
      .createQueryBuilder('penugasan')
      .leftJoinAndSelect('penugasan.kendaraan', 'kendaraan')
      .leftJoinAndSelect('penugasan.pns', 'pns');

    if (search) {
      qb.andWhere(
        `(LOWER(kendaraan.nopol) LIKE :search
          OR LOWER(kendaraan.merek) LIKE :search
          OR LOWER(pns.nama) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    if (kendaraanId !== undefined) {
      qb.andWhere('penugasan.kendaraanId = :kendaraanId', { kendaraanId });
    }

    if (pnsId !== undefined) {
      qb.andWhere('penugasan.pnsId = :pnsId', { pnsId });
    }

    if (status !== undefined) {
      qb.andWhere('penugasan.status = :status', { status });
    }

    if (peran !== undefined) {
      qb.andWhere('penugasan.peran = :peran', { peran });
    }

    qb.orderBy(`penugasan.${sortBy}`, sortOrder === 'asc' ? 'ASC' : 'DESC')
      .addOrderBy('penugasan.id', sortOrder === 'asc' ? 'ASC' : 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return toPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number): Promise<PenugasanKendaraan> {
    const entity = await this.penugasanRepository.findOne({
      where: { id },
      relations: { kendaraan: true, pns: true },
    });

    if (!entity) {
      throw new NotFoundException(`Penugasan dengan id ${id} tidak ditemukan.`);
    }

    return entity;
  }

  async update(
    id: number,
    dto: UpdatePenugasanDto,
  ): Promise<PenugasanKendaraan> {
    await this.dataSource.transaction(async (manager) => {
      const penugasanRepository = manager.getRepository(PenugasanKendaraan);

      const entity = await penugasanRepository.findOne({
        where: { id },
        relations: { kendaraan: true, pns: true },
      });

      if (!entity) {
        throw new NotFoundException(
          `Penugasan dengan id ${id} tidak ditemukan.`,
        );
      }

      const status: StatusPenugasan = dto.status ?? entity.status;
      const peran: PeranPenugasan = dto.peran ?? entity.peran;
      const tanggalMulai =
        dto.tanggalMulai !== undefined
          ? (toDateOnly(dto.tanggalMulai) as string)
          : entity.tanggalMulai;
      let tanggalSelesai =
        dto.tanggalSelesai !== undefined
          ? toDateOnly(dto.tanggalSelesai)
          : entity.tanggalSelesai;

      this.validateDateRange(tanggalMulai, tanggalSelesai);

      if (status === 'AKTIF') {
        await this.ensureNoActiveConflict(
          penugasanRepository,
          entity.kendaraan.nopol,
          entity.pns.nama,
          entity.kendaraanId,
          entity.pnsId,
          peran,
          id,
        );
      }

      if (status === 'SELESAI' && !tanggalSelesai) {
        tanggalSelesai = todayDateOnly();
      }

      entity.status = status;
      entity.peran = peran;
      entity.tanggalMulai = tanggalMulai;
      entity.tanggalSelesai = tanggalSelesai;

      if (dto.catatan !== undefined) {
        entity.catatan = trimNullableString(dto.catatan);
      }

      await penugasanRepository.save(entity);
      await this.synchronizeKendaraanStatus(manager, entity.kendaraanId);
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const penugasanRepository = manager.getRepository(PenugasanKendaraan);

      const entity = await penugasanRepository.findOneBy({ id });

      if (!entity) {
        throw new NotFoundException(
          `Penugasan dengan id ${id} tidak ditemukan.`,
        );
      }

      await penugasanRepository.delete(id);
      await this.synchronizeKendaraanStatus(manager, entity.kendaraanId);
    });
  }

  private async ensureNoActiveConflict(
    repository: Repository<PenugasanKendaraan>,
    nopol: string,
    namaPns: string,
    kendaraanId: number,
    pnsId: number,
    peran: PeranPenugasan,
    excludeId?: number,
  ): Promise<void> {
    const exclude = excludeId ? { id: Not(excludeId) } : {};

    if (peran === 'PENANGGUNG_JAWAB') {
      const activePenanggungJawab = await repository.count({
        where: {
          kendaraanId,
          status: 'AKTIF',
          peran: 'PENANGGUNG_JAWAB',
          ...exclude,
        },
      });

      if (activePenanggungJawab > 0) {
        throw new ConflictException(
          `Kendaraan dengan nopol "${nopol}" sudah memiliki penanggung jawab aktif. Selesaikan penugasan tersebut terlebih dahulu.`,
        );
      }
    }

    const duplicateAssignment = await repository.count({
      where: {
        kendaraanId,
        pnsId,
        status: 'AKTIF',
        ...exclude,
      },
    });

    if (duplicateAssignment > 0) {
      throw new ConflictException(
        `PNS "${namaPns}" sudah memiliki penugasan aktif pada kendaraan ini.`,
      );
    }
  }

  private validateDateRange(
    tanggalMulai: string,
    tanggalSelesai: string | null,
  ): void {
    if (tanggalSelesai && isDateBefore(tanggalSelesai, tanggalMulai)) {
      throw new BadRequestException(
        'tanggalSelesai tidak boleh lebih awal daripada tanggalMulai.',
      );
    }
  }

  private async synchronizeKendaraanStatus(
    manager: EntityManager,
    kendaraanId: number,
  ): Promise<void> {
    const kendaraanRepository = manager.getRepository(Kendaraan);
    const penugasanRepository = manager.getRepository(PenugasanKendaraan);

    const kendaraan = await kendaraanRepository.findOneBy({ id: kendaraanId });

    if (!kendaraan || kendaraan.status === 'NONAKTIF') {
      return;
    }

    const activeCount = await penugasanRepository.count({
      where: { kendaraanId, status: 'AKTIF' },
    });

    if (activeCount > 0) {
      kendaraan.status = 'DIGUNAKAN';
    } else if (kendaraan.kondisi === 'DALAM_PERBAIKAN') {
      kendaraan.status = 'PERBAIKAN';
    } else {
      kendaraan.status = 'TERSEDIA';
    }

    await kendaraanRepository.save(kendaraan);
  }
}
