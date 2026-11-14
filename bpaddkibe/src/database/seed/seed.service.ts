import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { todayDateOnly } from '../../common/utils/date.util.js';
import { Kendaraan } from '../../modules/kendaraan/entities/kendaraan.entity.js';
import { Pd } from '../../modules/pd/entities/pd.entity.js';
import { PenugasanKendaraan } from '../../modules/penugasan/entities/penugasan-kendaraan.entity.js';
import { Perawatan } from '../../modules/perawatan/entities/perawatan.entity.js';
import { Pns } from '../../modules/pns/entities/pns.entity.js';
import { RiwayatKondisi } from '../../modules/riwayat-kondisi/entities/riwayat-kondisi.entity.js';

const PD_SEED = [
  {
    kode: 'DISDIK',
    nama: 'Dinas Pendidikan',
    singkatan: 'DPendidikan',
    alamat: 'Jl. Pendidikan No. 1',
    telepon: '021-1234567',
  },
  {
    kode: 'DINKES',
    nama: 'Dinas Kesehatan',
    singkatan: 'DKesehatan',
    alamat: 'Jl. Kesehatan No. 2',
    telepon: '021-2345678',
  },
  {
    kode: 'PUPR',
    nama: 'Dinas Pekerjaan Umum dan Penataan Ruang',
    singkatan: 'PUPR',
    alamat: 'Jl. Pekerjaan Umum No. 3',
    telepon: '021-3456789',
  },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Pd)
    private readonly pdRepository: Repository<Pd>,
    @InjectRepository(Pns)
    private readonly pnsRepository: Repository<Pns>,
    @InjectRepository(Kendaraan)
    private readonly kendaraanRepository: Repository<Kendaraan>,
    @InjectRepository(PenugasanKendaraan)
    private readonly penugasanRepository: Repository<PenugasanKendaraan>,
    @InjectRepository(RiwayatKondisi)
    private readonly riwayatRepository: Repository<RiwayatKondisi>,
    @InjectRepository(Perawatan)
    private readonly perawatanRepository: Repository<Perawatan>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      if (this.configService.get<boolean>('seed.pd')) {
        await this.seedPd();
      }

      if (this.configService.get<boolean>('seed.demo')) {
        await this.seedDemoData();
      }
    } catch (error) {
      this.logger.error(
        'Gagal menjalankan seed data.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async seedPd(): Promise<void> {
    let inserted = 0;

    for (const item of PD_SEED) {
      const exists = await this.pdRepository.exists({
        where: { kode: item.kode },
      });

      if (!exists) {
        await this.pdRepository.save(this.pdRepository.create(item));
        inserted += 1;
      }
    }

    if (inserted > 0) {
      this.logger.log(
        `${inserted} Perangkat Daerah awal berhasil ditambahkan.`,
      );
    }
  }

  private async seedDemoData(): Promise<void> {
    const [jumlahPns, jumlahKendaraan] = await Promise.all([
      this.pnsRepository.count(),
      this.kendaraanRepository.count(),
    ]);

    if (jumlahPns > 0 || jumlahKendaraan > 0) {
      return;
    }

    const pds = await this.pdRepository.find();
    const byKode = new Map(pds.map((pd) => [pd.kode, pd]));

    const disdik = byKode.get('DISDIK');
    const dinkes = byKode.get('DINKES');
    const pupr = byKode.get('PUPR');

    if (!disdik || !dinkes || !pupr) {
      return;
    }

    const pns = await this.pnsRepository.save([
      this.pnsRepository.create({
        nama: 'Budi Santoso',
        nip: '197812312005011001',
        jabatan: 'Kepala Sub Bagian Umum',
        golongan: 'III/c',
        email: 'budi.santoso@example.go.id',
        telepon: '081234567890',
        pdId: disdik.id,
        aktif: true,
      }),
      this.pnsRepository.create({
        nama: 'Siti Aminah',
        nip: '198203152006042002',
        jabatan: 'Bendahara Pengeluaran',
        golongan: 'III/b',
        email: 'siti.aminah@example.go.id',
        telepon: '081298765432',
        pdId: dinkes.id,
        aktif: true,
      }),
      this.pnsRepository.create({
        nama: 'Agus Pratama',
        nip: '199005202010011003',
        jabatan: 'Pengelola Sarana dan Prasarana',
        golongan: 'II/d',
        email: 'agus.pratama@example.go.id',
        telepon: '081377788899',
        pdId: pupr.id,
        aktif: true,
      }),
    ]);

    const nextYear = `${new Date().getFullYear() + 1}-03-31`;

    const kendaraan = await this.kendaraanRepository.save([
      this.kendaraanRepository.create({
        nopol: 'B 1234 XYZ',
        merek: 'Toyota',
        tipe: 'Innova Zenix',
        tahun: 2023,
        warna: 'Hitam',
        kondisi: 'BAIK',
        status: 'TERSEDIA',
        nomorRangka: 'MHFXXXXX123456789',
        nomorMesin: '2GD1234567',
        odometer: 45000,
        tanggalPajak: nextYear,
        catatan: 'Kendaraan operasional pimpinan.',
        pdId: disdik.id,
      }),
      this.kendaraanRepository.create({
        nopol: 'B 5678 ABC',
        merek: 'Mitsubishi',
        tipe: 'Xpander',
        tahun: 2022,
        warna: 'Putih',
        kondisi: 'RUSAK_RINGAN',
        status: 'TERSEDIA',
        nomorRangka: 'MHFYYYYY987654321',
        nomorMesin: '4A91234567',
        odometer: 62000,
        tanggalPajak: nextYear,
        pdId: dinkes.id,
      }),
      this.kendaraanRepository.create({
        nopol: 'D 9012 DEF',
        merek: 'Honda',
        tipe: 'CR-V',
        tahun: 2021,
        warna: 'Silver',
        kondisi: 'BAIK',
        status: 'TERSEDIA',
        odometer: 71000,
        tanggalPajak: nextYear,
        pdId: pupr.id,
      }),
      this.kendaraanRepository.create({
        nopol: 'F 3456 GHI',
        merek: 'Isuzu',
        tipe: 'Elf',
        tahun: 2020,
        warna: 'Putih',
        kondisi: 'DALAM_PERBAIKAN',
        status: 'PERBAIKAN',
        odometer: 98000,
        tanggalPajak: `${new Date().getFullYear() - 1}-12-31`,
        pdId: disdik.id,
      }),
    ]);

    const budi = pns[0];
    const kendaraanUtama = kendaraan[0];

    await this.riwayatRepository.save(
      kendaraan.map((item) =>
        this.riwayatRepository.create({
          kendaraanId: item.id,
          kondisi: item.kondisi,
          tanggal: todayDateOnly(),
          keterangan: 'Kondisi awal saat kendaraan didaftarkan.',
        }),
      ),
    );

    await this.penugasanRepository.save(
      this.penugasanRepository.create({
        kendaraanId: kendaraanUtama.id,
        pnsId: budi.id,
        peran: 'PENANGGUNG_JAWAB',
        tanggalMulai: todayDateOnly(),
        status: 'AKTIF',
        catatan: 'Penanggung jawab harian kendaraan operasional.',
      }),
    );

    kendaraanUtama.status = 'DIGUNAKAN';
    await this.kendaraanRepository.save(kendaraanUtama);

    await this.perawatanRepository.save([
      this.perawatanRepository.create({
        kendaraanId: kendaraan[1].id,
        jenis: 'PERBAIKAN',
        tanggal: todayDateOnly(),
        deskripsi: 'Perbaikan lampu depan kanan dan wiper.',
        bengkel: 'Bengkel Mitra Jaya',
        biaya: 850000,
        odometer: 62000,
        status: 'SELESAI',
      }),
      this.perawatanRepository.create({
        kendaraanId: kendaraan[3].id,
        jenis: 'PERBAIKAN',
        tanggal: todayDateOnly(),
        deskripsi: 'Perbaikan sistem rem dan tune up mesin.',
        bengkel: 'Bengkel Sumber Rejeki',
        biaya: 2750000,
        odometer: 98000,
        status: 'TERJADWAL',
      }),
    ]);

    this.logger.log(
      'Data demo (3 PNS, 4 kendaraan, penugasan, riwayat kondisi, dan perawatan) berhasil ditambahkan.',
    );
  }
}
