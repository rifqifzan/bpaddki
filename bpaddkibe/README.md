# Sistem Informasi Kendaraan Dinas Operasional

Backend CRUD berbasis **NestJS** untuk mendata kendaraan dinas operasional,
memantau kondisi kendaraan, mencatat perawatan, serta mencatat **PNS yang
bertanggung jawab** atas penggunaan kendaraan. Data disimpan pada
**PostgreSQL** melalui **TypeORM**.

## Fitur

- CRUD **Perangkat Daerah (PD)**: Dinas Pendidikan, Dinas Kesehatan, PUPR, dan PD lain.
- CRUD **PNS** beserta NIP, jabatan, golongan, dan PD tempat bertugas.
- CRUD **Kendaraan** dinas: nopol, merek, tipe, tahun, warna, kondisi, dan status operasional.
- **Penugasan kendaraan** kepada PNS sebagai penanggung jawab atau pengemudi.
- **Riwayat kondisi** kendaraan sebagai jejak audit perubahan kondisi.
- **Perawatan** kendaraan beserta biaya, bengkel, dan pembaruan odometer.
- **Statistik kendaraan**: jumlah per kondisi/status, kendaraan perlu perhatian, pajak kedaluwarsa.
- Pagination, pencarian, filter, dan pengurutan pada seluruh endpoint daftar.
- Validasi request dengan `class-validator` dan pesan berbahasa Indonesia.
- Format error konsisten, request ID, structured logging, dan pemetaan error PostgreSQL.
- Keamanan: API key, Helmet, CORS, rate limiting, validasi ketat, dan `synchronize` mati di production.
- Dokumentasi OpenAPI/Swagger interaktif.

## Stack

| Komponen      | Teknologi                          |
| ------------- | ---------------------------------- |
| Runtime       | Node.js 24+, ESM                   |
| Framework     | NestJS 12                          |
| Database      | PostgreSQL 16                      |
| ORM           | TypeORM 1.x (`pg`)                 |
| Validasi      | class-validator, class-transformer |
| Dokumentasi   | `@nestjs/swagger`                  |
| Keamanan      | API key guard, Helmet, Throttler   |
| Health check  | `@nestjs/terminus`                 |
| Unit test     | Vitest                             |
| E2E test      | Vitest + Supertest + `pg-mem`      |

## Struktur Data

```
pd (1) â”€â”€< (N) pns
 â”‚              â”‚
 â”‚              â””â”€â”€< (N) penugasan_kendaraan >â”€â”€ (1) kendaraan
 â”‚                                                        â”‚
 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€< (N) kendaraan                             â”œâ”€â”€< (N) riwayat_kondisi
                                                          â””â”€â”€< (N) perawatan
```

| Entitas               | Keterangan                                                                 |
| --------------------- | -------------------------------------------------------------------------- |
| `pd`                  | Perangkat Daerah (`kode`, `nama`, `singkatan`, alamat, telepon, aktif).    |
| `pns`                 | PNS (`nama`, `nip` unik 18 digit, `jabatan`, `golongan`, `pd_id`).         |
| `kendaraan`           | Kendaraan (`nopol` unik, merek, tipe, tahun, warna, kondisi, status, dll). |
| `penugasan_kendaraan` | Penugasan PNS ke kendaraan (`peran`, tanggal mulai/selesai, status).       |
| `riwayat_kondisi`     | Audit perubahan kondisi kendaraan (tanggal, keterangan, pencatat).         |
| `perawatan`           | Servis/perbaikan (jenis, tanggal, deskripsi, bengkel, biaya, odometer).    |

Nilai domain yang dipakai:

- `kondisi`: `BAIK`, `RUSAK_RINGAN`, `RUSAK_BERAT`, `DALAM_PERBAIKAN`
- `status kendaraan`: `TERSEDIA`, `DIGUNAKAN`, `PERBAIKAN`, `NONAKTIF`
- `golongan`: `I/a` s.d. `IV/e`
- `peran penugasan`: `PENANGGUNG_JAWAB`, `PENGEMUDI`
- `status penugasan`: `AKTIF`, `SELESAI`
- `jenis perawatan`: `SERVIS_RUTIN`, `PERBAIKAN`, `GANTI_OLI`, `PAJAK`, `LAINNYA`
- `status perawatan`: `TERJADWAL`, `SELESAI`, `DIBATALKAN`

## Menjalankan dengan Docker Compose

Cara tercepat, PostgreSQL dan aplikasi dijalankan sekaligus.

```bash
cp .env.example .env
# ubah API_KEY di .env, lalu:
docker compose up --build
```

- API: <http://localhost:3300/api/v1>
- Swagger: <http://localhost:3300/docs>
- PostgreSQL: `localhost:5432`

> `docker-compose.yml` memakai `DB_SYNCHRONIZE=true` agar tabel dibuat otomatis.
> Untuk production, set `DB_SYNCHRONIZE=false` dan gunakan migration.

## Menjalankan Secara Lokal

Prasyarat: Node.js 24+, PostgreSQL 16+ (atau Docker untuk database saja).

1. Salin dan sesuaikan environment:

   ```bash
   cp .env.example .env
   ```

2. Siapkan database PostgreSQL:

   ```sql
   CREATE DATABASE kendaraan_dinas;
   ```

   Atau jalankan hanya PostgreSQL via Docker:

   ```bash
   docker compose up -d db
   ```

3. Install dependency dan jalankan:

   ```bash
   npm install
   npm run start:dev
   ```

4. Buka Swagger di <http://localhost:3300/docs>.

Saat pertama kali berjalan, aplikasi otomatis melakukan seed:

- 3 PD referensi: `DISDIK`, `DINKES`, `PUPR`.
- Data demo PNS, kendaraan, penugasan, riwayat kondisi, dan perawatan
  (hanya bila `SEED_DEMO=true` dan database masih kosong).

Matikan seed dengan `SEED_PD=false` dan `SEED_DEMO=false`.

## Environment Variable

| Variabel          | Default                  | Keterangan                                                        |
| ----------------- | ------------------------ | ----------------------------------------------------------------- |
| `NODE_ENV`        | `development`            | `development`, `test`, atau `production`.                         |
| `PORT`            | `3300`                   | Port HTTP aplikasi.                                               |
| `APP_NAME`        | Sistem Informasi ...     | Nama aplikasi pada response `/`.                                  |
| `API_PREFIX`      | `api/v1`                 | Prefix seluruh endpoint.                                          |
| `DB_HOST`         | `localhost`              | Host PostgreSQL.                                                  |
| `DB_PORT`         | `5432`                   | Port PostgreSQL.                                                  |
| `DB_USERNAME`     | `postgres`               | User PostgreSQL.                                                  |
| `DB_PASSWORD`     | `postgres`               | Password PostgreSQL.                                              |
| `DB_NAME`         | `kendaraan_dinas`        | Nama database.                                                    |
| `DB_SSL`          | `false`                  | Aktifkan SSL koneksi database.                                    |
| `DB_POOL_MAX`     | `10`                     | Maksimum koneksi pool.                                            |
| `DB_SYNCHRONIZE`  | `true` di non-production | TypeORM menyelaraskan skema otomatis. **Set `false` di production.** |
| `DB_LOGGING`      | `false`                  | Log query SQL.                                                    |
| `API_KEY`         | `dev-api-key-change-me`  | API key wajib untuk endpoint terproteksi. Minimal 16 karakter.    |
| `CORS_ORIGINS`    | `*`                      | Daftar origin dipisah koma, atau `*`.                             |
| `THROTTLE_TTL_MS` | `60000`                  | Jendela waktu rate limit (ms).                                    |
| `THROTTLE_LIMIT`  | `100`                    | Maksimum request per jendela waktu per IP.                        |
| `DOCS_ENABLED`    | `true`                   | Aktifkan Swagger UI dan `/docs-json`.                             |
| `DOCS_PATH`       | `docs`                   | Path Swagger UI.                                                  |
| `SEED_PD`         | `true`                   | Seed PD referensi.                                                |
| `SEED_DEMO`       | `true` di non-production | Seed data demo.                                                   |

Pada `NODE_ENV=production`, aplikasi menolak start bila `DB_HOST`, `DB_PORT`,
`DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, atau `API_KEY` belum diisi.

## Autentikasi

Semua endpoint CRUD memerlukan header:

```http
X-API-Key: dev-api-key-change-me
```

Endpoint publik: `GET /api/v1`, `GET /api/v1/health`, `/docs`, dan `/docs-json`.
Request tanpa API key atau dengan key salah menghasilkan `401`.

Di Swagger, klik **Authorize** lalu isi nilai API key.

## Base URL & Response

Base URL: `http://localhost:3300/api/v1`

- Endpoint detail/create/update mengembalikan objek data secara langsung.
- Endpoint daftar mengembalikan `{ "data": [...], "meta": {...} }`.
- Endpoint hapus mengembalikan `204 No Content`.

Contoh meta pagination:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Endpoint

### Sistem

| Method | Path             | Akses  | Keterangan                         |
| ------ | ---------------- | ------ | ---------------------------------- |
| GET    | `/api/v1`        | Publik | Informasi API dan tautan dokumen.  |
| GET    | `/api/v1/health` | Publik | Health check aplikasi + database.  |

### Perangkat Daerah (PD)

| Method | Path              | Keterangan                                                       |
| ------ | ----------------- | ---------------------------------------------------------------- |
| POST   | `/pd`             | Membuat PD. `kode` unik.                                         |
| GET    | `/pd`             | Daftar PD (pagination, pencarian, filter `aktif`).               |
| GET    | `/pd/{id}`        | Detail PD beserta jumlah PNS dan kendaraan.                      |
| PATCH  | `/pd/{id}`        | Mengubah PD.                                                     |
| DELETE | `/pd/{id}`        | Hapus PD. `409` bila masih memiliki PNS/kendaraan.               |

Query daftar: `page`, `limit`, `search`, `sortOrder`, `aktif`,
`sortBy` (`kode`, `nama`, `singkatan`, `createdAt`).

### PNS

| Method | Path        | Keterangan                                                            |
| ------ | ----------- | --------------------------------------------------------------------- |
| POST   | `/pns`      | Membuat PNS. `nip` unik 18 digit, `pdId` wajib valid.                 |
| GET    | `/pns`      | Daftar PNS dengan relasi PD.                                          |
| GET    | `/pns/{id}` | Detail PNS.                                                           |
| PATCH  | `/pns/{id}` | Mengubah PNS.                                                         |
| DELETE | `/pns/{id}` | Hapus PNS. `409` bila memiliki riwayat penugasan.                     |

Query daftar: `page`, `limit`, `search`, `sortOrder`, `pdId`, `golongan`,
`aktif`, `sortBy` (`nama`, `nip`, `jabatan`, `golongan`, `createdAt`).

### Kendaraan

| Method | Path                    | Keterangan                                                                 |
| ------ | ----------------------- | -------------------------------------------------------------------------- |
| POST   | `/kendaraan`            | Mendaftarkan kendaraan. Nopol dinormalisasi otomatis.                      |
| GET    | `/kendaraan`            | Daftar kendaraan.                                                          |
| GET    | `/kendaraan/statistik`  | Statistik kondisi/status, perlu perhatian, pajak kedaluwarsa.              |
| GET    | `/kendaraan/{id}`       | Detail kendaraan + penugasan aktif + riwayat kondisi terbaru.              |
| PATCH  | `/kendaraan/{id}`       | Mengubah kendaraan. Perubahan kondisi otomatis dicatat ke riwayat.         |
| DELETE | `/kendaraan/{id}`       | Hapus kendaraan. `409` bila memiliki riwayat penugasan.                    |

Query daftar: `page`, `limit`, `search`, `sortOrder`, `kondisi`, `status`,
`pdId`, `tahun`, `sortBy` (`nopol`, `merek`, `tipe`, `tahun`, `kondisi`,
`status`, `createdAt`).

Contoh membuat kendaraan:

```bash
curl -X POST http://localhost:3300/api/v1/kendaraan \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-api-key-change-me" \
  -d '{
    "nopol": "b1234xyz",
    "merek": "Toyota",
    "tipe": "Innova Zenix",
    "tahun": 2023,
    "warna": "Hitam",
    "pdId": 1,
    "odometer": 45000,
    "tanggalPajak": "2027-03-31"
  }'
```

`nopol` akan disimpan sebagai `B 1234 XYZ`.

### Penugasan Kendaraan

| Method | Path              | Keterangan                                                                 |
| ------ | ----------------- | -------------------------------------------------------------------------- |
| POST   | `/penugasan`      | Menugaskan PNS ke kendaraan. Status kendaraan menjadi `DIGUNAKAN`.         |
| GET    | `/penugasan`      | Daftar penugasan.                                                          |
| GET    | `/penugasan/{id}` | Detail penugasan + kendaraan + PNS.                                        |
| PATCH  | `/penugasan/{id}` | Ubah/akhiri penugasan. Kirim `status: "SELESAI"` untuk mengakhiri.          |
| DELETE | `/penugasan/{id}` | Hapus penugasan dan sinkronkan status kendaraan.                           |

Query daftar: `page`, `limit`, `search`, `sortOrder`, `kendaraanId`, `pnsId`,
`status`, `peran`, `sortBy` (`tanggalMulai`, `tanggalSelesai`, `status`, `createdAt`).

Aturan bisnis:

- Satu kendaraan hanya boleh memiliki **satu penanggung jawab aktif**.
- PNS yang tidak aktif (`aktif=false`) tidak dapat ditugaskan.
- Kendaraan `NONAKTIF` tidak dapat ditugaskan.
- `tanggalSelesai` tidak boleh lebih awal dari `tanggalMulai`.
- Saat penugasan selesai/dihapus, status kendaraan kembali ke `TERSEDIA`
  atau `PERBAIKAN` (mengikuti kondisi kendaraan).

### Riwayat Kondisi

| Method | Path                                        | Keterangan                                              |
| ------ | ------------------------------------------- | ------------------------------------------------------- |
| POST   | `/kendaraan/{kendaraanId}/riwayat-kondisi`  | Mencatat kondisi baru dan memperbarui kondisi kendaraan. |
| GET    | `/kendaraan/{kendaraanId}/riwayat-kondisi`  | Riwayat kondisi satu kendaraan.                          |
| GET    | `/riwayat-kondisi`                          | Riwayat kondisi seluruh kendaraan.                       |
| GET    | `/riwayat-kondisi/{id}`                     | Detail satu riwayat kondisi.                             |

Query daftar: `page`, `limit`, `search`, `sortOrder`, `kendaraanId`,
`kondisi`, `from`, `to`, `sortBy` (`tanggal`, `createdAt`).

Kondisi `DALAM_PERBAIKAN` otomatis mengubah status kendaraan menjadi
`PERBAIKAN`. Riwayat bersifat audit: tidak ada endpoint update/delete.

### Perawatan

| Method | Path              | Keterangan                                                               |
| ------ | ----------------- | ------------------------------------------------------------------------ |
| POST   | `/perawatan`      | Mencatat perawatan. Odometer kendaraan ikut naik bila lebih tinggi.      |
| GET    | `/perawatan`      | Daftar perawatan.                                                        |
| GET    | `/perawatan/{id}` | Detail perawatan.                                                        |
| PATCH  | `/perawatan/{id}` | Mengubah catatan perawatan.                                              |
| DELETE | `/perawatan/{id}` | Menghapus catatan perawatan.                                             |

Query daftar: `page`, `limit`, `search`, `sortOrder`, `kendaraanId`,
`jenis`, `status`, `from`, `to`, `sortBy` (`tanggal`, `biaya`, `createdAt`).

## Validasi

- Payload hanya boleh berisi properti yang terdaftar. Properti asing ditolak `400`.
- `nopol` dinormalisasi (`b1234xyz` â†’ `B 1234 XYZ`) lalu divalidasi formatnya.
- `nip` wajib tepat 18 digit.
- `email` dinormalisasi menjadi huruf kecil dan harus unik.
- `kode` PD otomatis huruf kapital dan hanya boleh huruf, angka, tanda hubung.
- Tanggal memakai format ISO 8601 (`YYYY-MM-DD`).
- `page` minimal 1, `limit` antara 1â€“100.
- Nilai enum (kondisi, status, golongan, jenis, peran) divalidasi ketat.
- Field opsional berupa string kosong dinormalisasi menjadi `null`.

Contoh error validasi:

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validasi gagal.",
  "details": [
    "nopol: nopol tidak valid. Contoh format yang benar: B 1234 XYZ atau AB 1234 CD.",
    "tahun: tahun minimal 1900."
  ],
  "path": "/api/v1/kendaraan",
  "method": "POST",
  "timestamp": "2026-11-14T10:15:30.000Z",
  "requestId": "4b1f2f2e-7d1c-4d8e-9a4b-0d4f8a7c1e2f"
}
```

## Kode Status & Error

| Status | Arti                                                                 |
| ------ | -------------------------------------------------------------------- |
| `200`  | Request berhasil.                                                    |
| `201`  | Data berhasil dibuat.                                                |
| `204`  | Data berhasil dihapus.                                               |
| `400`  | Payload/query tidak valid.                                           |
| `401`  | `X-API-Key` tidak dikirim atau salah.                                |
| `404`  | Data/endpoint tidak ditemukan.                                       |
| `409`  | Duplikat data atau konflik relasi/business rule.                     |
| `429`  | Rate limit terlampaui.                                               |
| `500`  | Kesalahan server.                                                    |

Error PostgreSQL `23505` (unique), `23503` (foreign key), `23502` (not null),
dan `22P02`/`22007`/`22008` (format data) dipetakan ke response yang aman.

## Keamanan

- **API key guard** global dengan perbandingan `timingSafeEqual`.
- **Helmet** dengan Content Security Policy yang mendukung Swagger UI.
- **CORS** dibatasi melalui `CORS_ORIGINS`.
- **Rate limiting** global melalui `@nestjs/throttler`.
- **ValidationPipe** dengan `whitelist` dan `forbidNonWhitelisted`.
- **Global exception filter** agar stack trace tidak bocor ke client.
- **Request ID** (`X-Request-Id`) untuk korelasi log.
- **Limit body** disarankan diatur di reverse proxy (nginx/traefik).
- Jalankan di belakang HTTPS saat production.

## Testing

```bash
npm test          # unit test
npm run test:e2e  # e2e test
npm run lint      # lint + type-aware check
npm run build     # kompilasi
```

E2E test menjalankan modul aplikasi asli terhadap **pg-mem** (emulator
PostgreSQL in-memory), sehingga tidak membutuhkan server PostgreSQL.
Production tetap menggunakan PostgreSQL asli.

Cakupan e2e: autentikasi, validasi, CRUD seluruh entitas, pagination/filter,
normalisasi nopol, aturan penugasan, riwayat kondisi, perawatan, statistik,
dan aturan penghapusan.

## Dokumentasi API

- Swagger UI: <http://localhost:3300/docs>
- OpenAPI JSON: <http://localhost:3300/docs-json>

Dokumentasi memuat seluruh endpoint, schema request/response, contoh payload,
dan skema keamanan `X-API-Key`.

## Catatan Production

1. Set `NODE_ENV=production`, `DB_SYNCHRONIZE=false`, dan `API_KEY` yang kuat.
2. Gunakan migration TypeORM untuk perubahan skema, bukan `synchronize`.
3. Batasi `CORS_ORIGINS` ke domain frontend yang dikenal.
4. Jalankan aplikasi di belakang reverse proxy HTTPS.
5. Gunakan user PostgreSQL khusus aplikasi dengan hak minimum.
6. Backup database secara berkala dan pantau endpoint `/api/v1/health`.
7. Jangan mengaktifkan `SEED_DEMO` pada database production.
