# Kendaraan Dinas Operasional — Frontend

Antarmuka web untuk mengelola **kendaraan dinas operasional**, **PNS penanggung
jawab**, **penugasan**, **riwayat kondisi**, dan **perawatan kendaraan**.
Dibangun dengan Next.js App Router, React, dan Tailwind CSS.

Frontend ini memakai API backend NestJS pada repositori `bpaddkibe`.
Seluruh permintaan ke backend diteruskan melalui route handler Next.js
(`/api/backend/...`) yang menambahkan header `X-API-Key` di sisi server,
sehingga API key tidak pernah dikirim ke browser.

## Prasyarat

- Node.js 20+
- Backend `bpaddkibe` berjalan di `http://localhost:3000/api/v1`
- Database PostgreSQL untuk backend (lihat README backend)

## Menjalankan

1. Salin konfigurasi environment:

   ```bash
   cp .env.example .env.local
   ```

2. Sesuaikan nilai berikut bila perlu:

   | Variabel          | Default                        | Keterangan                              |
   | ----------------- | ------------------------------ | --------------------------------------- |
   | `BACKEND_API_URL` | `http://localhost:3000/api/v1` | Base URL API backend, termasuk prefiks. |
   | `BACKEND_API_KEY` | `dev-api-key-change-me`        | API key backend, hanya dipakai server.  |

3. Install dependency dan jalankan:

   ```bash
   npm install
   npm run dev
   ```

4. Buka <http://localhost:3001>.

Frontend memakai port **3001** karena backend memakai port 3000.

## Perintah

| Perintah            | Keterangan                          |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Development server di port 3001.    |
| `npm run build`     | Build produksi.                     |
| `npm run start`     | Menjalankan hasil build di port 3001. |
| `npm run typecheck` | Pemeriksaan TypeScript tanpa emit.  |

## Fitur

- **Dashboard** — statistik kendaraan per kondisi/status, unit yang perlu
  perhatian, pajak kedaluwarsa, dan penanggung jawab aktif.
- **Kendaraan** — daftar dengan pencarian, filter kondisi/status/PD, tambah,
  detail, ubah, dan hapus. Detail menampilkan identitas unit, kondisi terkini,
  PNS penanggung jawab dan pengemudi aktif, riwayat kondisi, serta perawatan
  terakhir.
- **Penugasan** — tugaskan PNS sebagai penanggung jawab atau pengemudi, ubah
  penugasan, akhiri penugasan, dan hapus riwayat penugasan.
- **Perawatan** — catat servis/perbaikan beserta biaya, bengkel, dan odometer;
  ubah dan hapus catatan perawatan.
- **Riwayat kondisi** — catat kondisi kendaraan (audit) dan telusuri riwayat
  seluruh unit dengan filter kondisi, kendaraan, dan rentang tanggal.
- **PNS** — CRUD data PNS beserta NIP, jabatan, golongan, PD, dan kontak.
- **Perangkat daerah** — CRUD PD beserta jumlah PNS dan kendaraan.

Aturan bisnis backend tetap berlaku, misalnya satu penanggung jawab aktif per
kendaraan, PNS nonaktif tidak dapat ditugaskan, dan data yang memiliki riwayat
tidak dapat dihapus (pesan `409` ditampilkan apa adanya).
