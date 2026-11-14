import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { createTestApp } from './create-test-app.js';

interface PdBody {
  id: number;
  kode: string;
  nama: string;
  jumlahPns?: number;
  jumlahKendaraan?: number;
}

interface PnsBody {
  id: number;
  nama: string;
  nip: string;
  pd?: { id: number };
}

interface KendaraanBody {
  id: number;
  nopol: string;
  kondisi: string;
  status: string;
  odometer: number;
  penugasanAktif?: { id: number } | null;
  riwayatKondisiTerbaru?: { kondisi: string } | null;
}

interface PenugasanBody {
  id: number;
  status: string;
  tanggalSelesai: string | null;
}

interface PaginatedBody<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ErrorBody {
  success: false;
  statusCode: number;
  message: string;
  details?: string[];
}

describe('API Kendaraan Dinas Operasional (e2e)', () => {
  let app: INestApplication<App>;
  let apiKey: string;

  let pdId: number;
  let pnsId: number;
  let pnsKeduaId: number;
  let kendaraanId: number;
  let penugasanId: number;
  let penugasanKeduaId: number;
  let perawatanId: number;

  const http = () => request(app.getHttpServer());

  const auth = () => {
    const server = app.getHttpServer();
    const withKey = (test: request.Test) => test.set('X-API-Key', apiKey);

    return {
      get: (url: string) => withKey(request(server).get(url)),
      post: (url: string) => withKey(request(server).post(url)),
      put: (url: string) => withKey(request(server).put(url)),
      patch: (url: string) => withKey(request(server).patch(url)),
      delete: (url: string) => withKey(request(server).delete(url)),
    };
  };

  beforeAll(async () => {
    const context = await createTestApp();
    app = context.app;
    apiKey = context.apiKey;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Sistem & keamanan', () => {
    it('menyediakan informasi API tanpa API key', async () => {
      const response = await http().get('/api/v1').expect(200);

      expect(response.body).toMatchObject({
        version: '1.0.0',
        status: 'ok',
        docs: '/docs',
      });
      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('menyediakan health check database tanpa API key', async () => {
      const response = await http().get('/api/v1/health').expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.details.database.status).toBe('up');
    });

    it('menghasilkan dokumentasi OpenAPI', async () => {
      const response = await http().get('/docs-json').expect(200);

      expect(response.body.info.title).toBe('API Kendaraan Dinas Operasional');
      expect(response.body.paths['/api/v1/kendaraan']).toBeDefined();
      expect(response.body.paths['/api/v1/pd/{id}']).toBeDefined();
      expect(response.body.paths['/api/v1/penugasan']).toBeDefined();
    });

    it('menolak request tanpa API key', async () => {
      const response = await http().get('/api/v1/pd').expect(401);

      const body = response.body as ErrorBody;
      expect(body.success).toBe(false);
      expect(body.statusCode).toBe(401);
    });

    it('menolak API key yang salah', async () => {
      await http()
        .get('/api/v1/pd')
        .set('X-API-Key', 'api-key-yang-salah')
        .expect(401);
    });

    it('mengembalikan 404 dengan format error konsisten untuk route tidak dikenal', async () => {
      const response = await auth().get('/api/v1/tidak-ada').expect(404);

      const body = response.body as ErrorBody;
      expect(body.success).toBe(false);
      expect(body.message).toContain('tidak ditemukan');
    });
  });

  describe('CRUD Perangkat Daerah', () => {
    it('menolak payload kosong dengan rincian validasi', async () => {
      const response = await auth().post('/api/v1/pd').send({}).expect(400);

      const body = response.body as ErrorBody;
      expect(body.message).toBe('Validasi gagal.');
      expect(body.details?.length).toBeGreaterThan(0);
      expect(body.details?.join(' ')).toContain('kode');
    });

    it('menolak properti yang tidak dikenal', async () => {
      const response = await auth()
        .post('/api/v1/pd')
        .send({
          kode: 'TEST',
          nama: 'Dinas Test',
          propertiAsing: true,
        })
        .expect(400);

      expect((response.body as ErrorBody).details?.join(' ')).toContain(
        'propertiAsing',
      );
    });

    it('membuat PD baru', async () => {
      const response = await auth()
        .post('/api/v1/pd')
        .send({
          kode: 'disdik',
          nama: 'Dinas Pendidikan',
          singkatan: 'DPendidikan',
          alamat: 'Jl. Pendidikan No. 1',
          telepon: '021-1234567',
        })
        .expect(201);

      const body = response.body as PdBody;
      expect(body.kode).toBe('DISDIK');
      expect(body.nama).toBe('Dinas Pendidikan');
      pdId = body.id;
    });

    it('menolak kode PD duplikat', async () => {
      const response = await auth()
        .post('/api/v1/pd')
        .send({ kode: 'DISDIK', nama: 'Dinas Pendidikan Lain' })
        .expect(409);

      expect((response.body as ErrorBody).success).toBe(false);
    });

    it('menampilkan daftar PD dengan pencarian dan pagination', async () => {
      const response = await auth()
        .get('/api/v1/pd')
        .query({ search: 'pendidikan', page: 1, limit: 5 })
        .expect(200);

      const body = response.body as PaginatedBody<PdBody>;
      expect(body.data).toHaveLength(1);
      expect(body.meta).toMatchObject({
        page: 1,
        limit: 5,
        total: 1,
      });
      expect(body.data[0].jumlahPns).toBe(0);
      expect(body.data[0].jumlahKendaraan).toBe(0);
    });

    it('menampilkan detail PD', async () => {
      const response = await auth().get(`/api/v1/pd/${pdId}`).expect(200);

      expect((response.body as PdBody).id).toBe(pdId);
    });

    it('mengubah data PD', async () => {
      const response = await auth()
        .patch(`/api/v1/pd/${pdId}`)
        .send({ nama: 'Dinas Pendidikan Provinsi' })
        .expect(200);

      expect((response.body as PdBody).nama).toBe('Dinas Pendidikan Provinsi');
    });

    it('mengembalikan 404 untuk PD yang tidak ada', async () => {
      const response = await auth().get('/api/v1/pd/999999').expect(404);

      expect((response.body as ErrorBody).statusCode).toBe(404);
    });
  });

  describe('CRUD PNS', () => {
    it('menolak NIP yang bukan 18 digit', async () => {
      const response = await auth()
        .post('/api/v1/pns')
        .send({
          nama: 'Budi Santoso',
          nip: '123',
          jabatan: 'Staf',
          golongan: 'III/a',
          pdId,
        })
        .expect(400);

      expect((response.body as ErrorBody).details?.join(' ')).toContain(
        '18 digit',
      );
    });

    it('menolak PD yang tidak ada', async () => {
      await auth()
        .post('/api/v1/pns')
        .send({
          nama: 'Budi Santoso',
          nip: '197812312005011001',
          jabatan: 'Staf',
          golongan: 'III/a',
          pdId: 999999,
        })
        .expect(404);
    });

    it('membuat PNS baru', async () => {
      const response = await auth()
        .post('/api/v1/pns')
        .send({
          nama: 'Budi Santoso',
          nip: '197812312005011001',
          jabatan: 'Kepala Sub Bagian Umum',
          golongan: 'III/c',
          email: 'BUDI.SANTOSO@EXAMPLE.GO.ID',
          telepon: '081234567890',
          pdId,
        })
        .expect(201);

      const body = response.body as PnsBody;
      expect(body.nama).toBe('Budi Santoso');
      expect(body.nip).toBe('197812312005011001');
      pnsId = body.id;
    });

    it('menolak NIP duplikat', async () => {
      await auth()
        .post('/api/v1/pns')
        .send({
          nama: 'PNS Lain',
          nip: '197812312005011001',
          jabatan: 'Staf',
          golongan: 'II/a',
          pdId,
        })
        .expect(409);
    });

    it('membuat PNS kedua untuk pengujian penugasan', async () => {
      const response = await auth()
        .post('/api/v1/pns')
        .send({
          nama: 'Siti Aminah',
          nip: '198203152006042002',
          jabatan: 'Bendahara Pengeluaran',
          golongan: 'III/b',
          pdId,
        })
        .expect(201);

      pnsKeduaId = (response.body as PnsBody).id;
    });

    it('menampilkan daftar PNS dengan filter PD', async () => {
      const response = await auth()
        .get('/api/v1/pns')
        .query({ pdId, aktif: true, search: 'budi' })
        .expect(200);

      const body = response.body as PaginatedBody<PnsBody>;
      expect(body.meta.total).toBe(1);
      expect(body.data[0].pd?.id).toBe(pdId);
    });

    it('mengubah data PNS', async () => {
      const response = await auth()
        .patch(`/api/v1/pns/${pnsId}`)
        .send({ jabatan: 'Kepala Bagian Umum' })
        .expect(200);

      expect((response.body as PnsBody).nama).toBe('Budi Santoso');
    });
  });

  describe('CRUD Kendaraan', () => {
    it('menolak nopol dan tahun yang tidak valid', async () => {
      const response = await auth()
        .post('/api/v1/kendaraan')
        .send({
          nopol: 'XYZ',
          merek: 'Toyota',
          tipe: 'Innova',
          tahun: 1800,
          warna: 'Hitam',
        })
        .expect(400);

      const details = (response.body as ErrorBody).details?.join(' ') ?? '';
      expect(details).toContain('nopol');
      expect(details).toContain('tahun');
    });

    it('membuat kendaraan dan menormalisasi nopol', async () => {
      const response = await auth()
        .post('/api/v1/kendaraan')
        .send({
          nopol: 'b1234xyz',
          merek: 'Toyota',
          tipe: 'Innova Zenix',
          tahun: 2023,
          warna: 'Hitam',
          pdId,
          odometer: 45000,
          tanggalPajak: '2027-03-31',
          nomorRangka: 'MHFXXXXX123456789',
          nomorMesin: '2GD1234567',
        })
        .expect(201);

      const body = response.body as KendaraanBody;
      expect(body.nopol).toBe('B 1234 XYZ');
      expect(body.kondisi).toBe('BAIK');
      expect(body.status).toBe('TERSEDIA');
      expect(body.riwayatKondisiTerbaru?.kondisi).toBe('BAIK');
      kendaraanId = body.id;
    });

    it('menolak nopol duplikat dalam format berbeda', async () => {
      await auth()
        .post('/api/v1/kendaraan')
        .send({
          nopol: 'B 1234 XYZ',
          merek: 'Toyota',
          tipe: 'Avanza',
          tahun: 2022,
          warna: 'Putih',
        })
        .expect(409);
    });

    it('menampilkan daftar kendaraan dengan filter', async () => {
      const response = await auth()
        .get('/api/v1/kendaraan')
        .query({ kondisi: 'BAIK', search: 'innova', pdId })
        .expect(200);

      const body = response.body as PaginatedBody<KendaraanBody>;
      expect(body.meta.total).toBe(1);
      expect(body.data[0].nopol).toBe('B 1234 XYZ');
      expect(body.data[0].penugasanAktif).toBeUndefined();
    });

    it('mengubah kondisi kendaraan dan otomatis mencatat riwayat', async () => {
      const response = await auth()
        .patch(`/api/v1/kendaraan/${kendaraanId}`)
        .send({ kondisi: 'RUSAK_RINGAN' })
        .expect(200);

      expect((response.body as KendaraanBody).kondisi).toBe('RUSAK_RINGAN');
      expect(
        (response.body as KendaraanBody).riwayatKondisiTerbaru?.kondisi,
      ).toBe('RUSAK_RINGAN');

      const riwayat = await auth()
        .get(`/api/v1/kendaraan/${kendaraanId}/riwayat-kondisi`)
        .expect(200);

      const body = riwayat.body as PaginatedBody<{ kondisi: string }>;
      expect(body.meta.total).toBe(2);
      expect(body.data[0].kondisi).toBe('RUSAK_RINGAN');
    });

    it('menampilkan statistik kendaraan', async () => {
      const response = await auth()
        .get('/api/v1/kendaraan/statistik')
        .expect(200);

      expect(response.body).toMatchObject({
        total: 1,
        perluPerhatian: 1,
      });
      expect(response.body.byKondisi.RUSAK_RINGAN).toBe(1);
      expect(response.body.byStatus.TERSEDIA).toBe(1);
    });
  });

  describe('Penugasan kendaraan kepada PNS', () => {
    it('menolak rentang tanggal yang tidak valid', async () => {
      const response = await auth()
        .post('/api/v1/penugasan')
        .send({
          kendaraanId,
          pnsId,
          tanggalMulai: '2026-06-01',
          tanggalSelesai: '2026-05-01',
        })
        .expect(400);

      expect((response.body as ErrorBody).message).toContain('tanggalSelesai');
    });

    it('membuat penugasan aktif dan mengubah status kendaraan', async () => {
      const response = await auth()
        .post('/api/v1/penugasan')
        .send({
          kendaraanId,
          pnsId,
          tanggalMulai: '2026-01-01',
          catatan: 'Penanggung jawab harian.',
        })
        .expect(201);

      const body = response.body as PenugasanBody;
      expect(body.status).toBe('AKTIF');
      penugasanId = body.id;

      const kendaraan = await auth()
        .get(`/api/v1/kendaraan/${kendaraanId}`)
        .expect(200);

      const kendaraanBody = kendaraan.body as KendaraanBody;
      expect(kendaraanBody.status).toBe('DIGUNAKAN');
      expect(kendaraanBody.penugasanAktif?.id).toBe(penugasanId);
    });

    it('menolak penanggung jawab aktif kedua pada kendaraan yang sama', async () => {
      const response = await auth()
        .post('/api/v1/penugasan')
        .send({
          kendaraanId,
          pnsId: pnsKeduaId,
          tanggalMulai: '2026-02-01',
        })
        .expect(409);

      expect((response.body as ErrorBody).message).toContain(
        'penanggung jawab aktif',
      );
    });

    it('mengakhiri penugasan dan mengembalikan status kendaraan', async () => {
      const response = await auth()
        .patch(`/api/v1/penugasan/${penugasanId}`)
        .send({ status: 'SELESAI' })
        .expect(200);

      const body = response.body as PenugasanBody;
      expect(body.status).toBe('SELESAI');
      expect(body.tanggalSelesai).toBeTruthy();

      const kendaraan = await auth()
        .get(`/api/v1/kendaraan/${kendaraanId}`)
        .expect(200);

      expect((kendaraan.body as KendaraanBody).status).toBe('TERSEDIA');
    });

    it('membuat dan menghapus penugasan kedua', async () => {
      const createResponse = await auth()
        .post('/api/v1/penugasan')
        .send({
          kendaraanId,
          pnsId: pnsKeduaId,
          tanggalMulai: '2026-03-01',
        })
        .expect(201);

      penugasanKeduaId = (createResponse.body as PenugasanBody).id;

      await auth().delete(`/api/v1/penugasan/${penugasanKeduaId}`).expect(204);

      const kendaraan = await auth()
        .get(`/api/v1/kendaraan/${kendaraanId}`)
        .expect(200);

      expect((kendaraan.body as KendaraanBody).status).toBe('TERSEDIA');
    });

    it('menampilkan daftar penugasan dengan filter kendaraan', async () => {
      const response = await auth()
        .get('/api/v1/penugasan')
        .query({ kendaraanId, limit: 10 })
        .expect(200);

      const body = response.body as PaginatedBody<PenugasanBody>;
      expect(body.meta.total).toBe(1);
      expect(body.data[0].status).toBe('SELESAI');
    });
  });

  describe('Riwayat kondisi', () => {
    it('mencatat kondisi DALAM_PERBAIKAN dan memperbarui status kendaraan', async () => {
      const response = await auth()
        .post(`/api/v1/kendaraan/${kendaraanId}/riwayat-kondisi`)
        .send({
          kondisi: 'DALAM_PERBAIKAN',
          keterangan: 'Masuk bengkel untuk perbaikan body.',
          dicatatOleh: 'Siti Aminah',
        })
        .expect(201);

      expect(response.body.kondisi).toBe('DALAM_PERBAIKAN');

      const kendaraan = await auth()
        .get(`/api/v1/kendaraan/${kendaraanId}`)
        .expect(200);

      const body = kendaraan.body as KendaraanBody;
      expect(body.kondisi).toBe('DALAM_PERBAIKAN');
      expect(body.status).toBe('PERBAIKAN');
    });

    it('menampilkan riwayat kondisi global dengan filter', async () => {
      const response = await auth()
        .get('/api/v1/riwayat-kondisi')
        .query({ kendaraanId, kondisi: 'DALAM_PERBAIKAN' })
        .expect(200);

      const body = response.body as PaginatedBody<{ kondisi: string }>;
      expect(body.meta.total).toBe(1);
      expect(body.data[0].kondisi).toBe('DALAM_PERBAIKAN');
    });
  });

  describe('Perawatan kendaraan', () => {
    it('mencatat perawatan dan memperbarui odometer', async () => {
      const response = await auth()
        .post('/api/v1/perawatan')
        .send({
          kendaraanId,
          jenis: 'PERBAIKAN',
          tanggal: '2026-11-14',
          deskripsi: 'Perbaikan body dan pengecatan.',
          bengkel: 'Bengkel Mitra Jaya',
          biaya: 2500000,
          odometer: 46000,
        })
        .expect(201);

      const body = response.body as { id: number; biaya: number };
      expect(body.biaya).toBe(2500000);
      perawatanId = body.id;

      const kendaraan = await auth()
        .get(`/api/v1/kendaraan/${kendaraanId}`)
        .expect(200);

      expect((kendaraan.body as KendaraanBody).odometer).toBe(46000);
    });

    it('mengubah dan menghapus perawatan', async () => {
      const update = await auth()
        .patch(`/api/v1/perawatan/${perawatanId}`)
        .send({ biaya: 2750000, status: 'SELESAI' })
        .expect(200);

      expect(update.body.biaya).toBe(2750000);

      await auth().delete(`/api/v1/perawatan/${perawatanId}`).expect(204);
    });
  });

  describe('Aturan penghapusan dan validasi lanjutan', () => {
    it('menolak penghapusan PD yang masih memiliki PNS/kendaraan', async () => {
      const response = await auth().delete(`/api/v1/pd/${pdId}`).expect(409);

      expect((response.body as ErrorBody).message).toContain(
        'tidak dapat dihapus',
      );
    });

    it('menolak penghapusan PNS yang memiliki riwayat penugasan', async () => {
      await auth().delete(`/api/v1/pns/${pnsId}`).expect(409);
    });

    it('menolak limit pagination di atas 100', async () => {
      const response = await auth()
        .get('/api/v1/kendaraan')
        .query({ limit: 1000 })
        .expect(400);

      expect((response.body as ErrorBody).details?.join(' ')).toContain(
        'limit',
      );
    });

    it('menolak filter kondisi yang tidak dikenal', async () => {
      const response = await auth()
        .get('/api/v1/kendaraan')
        .query({ kondisi: 'HANCUR' })
        .expect(400);

      expect((response.body as ErrorBody).details?.join(' ')).toContain(
        'kondisi',
      );
    });

    it('menolak ID non-numerik', async () => {
      await auth().get('/api/v1/kendaraan/abc').expect(400);
    });

    it('menolak penghapusan kendaraan yang memiliki riwayat penugasan', async () => {
      const response = await auth()
        .delete(`/api/v1/kendaraan/${kendaraanId}`)
        .expect(409);

      expect((response.body as ErrorBody).message).toContain(
        'tidak dapat dihapus',
      );
    });

    it('menghapus kendaraan tanpa penugasan beserta riwayat kondisinya', async () => {
      const created = await auth()
        .post('/api/v1/kendaraan')
        .send({
          nopol: 'B 9999 ZZZ',
          merek: 'Suzuki',
          tipe: 'Ertiga',
          tahun: 2024,
          warna: 'Abu-abu',
          pdId,
        })
        .expect(201);

      const kendaraanTanpaPenugasanId = (created.body as KendaraanBody).id;

      await auth()
        .delete(`/api/v1/kendaraan/${kendaraanTanpaPenugasanId}`)
        .expect(204);

      await auth()
        .get(`/api/v1/kendaraan/${kendaraanTanpaPenugasanId}`)
        .expect(404);
    });
  });
});
