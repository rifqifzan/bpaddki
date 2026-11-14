export type KondisiKendaraan =
  | "BAIK"
  | "RUSAK_RINGAN"
  | "RUSAK_BERAT"
  | "DALAM_PERBAIKAN";

export type StatusKendaraan =
  | "TERSEDIA"
  | "DIGUNAKAN"
  | "PERBAIKAN"
  | "NONAKTIF";

export type GolonganPns =
  | "I/a"
  | "I/b"
  | "I/c"
  | "I/d"
  | "II/a"
  | "II/b"
  | "II/c"
  | "II/d"
  | "III/a"
  | "III/b"
  | "III/c"
  | "III/d"
  | "IV/a"
  | "IV/b"
  | "IV/c"
  | "IV/d"
  | "IV/e";

export type PeranPenugasan = "PENANGGUNG_JAWAB" | "PENGEMUDI";
export type StatusPenugasan = "AKTIF" | "SELESAI";
export type JenisPerawatan =
  | "SERVIS_RUTIN"
  | "PERBAIKAN"
  | "GANTI_OLI"
  | "PAJAK"
  | "LAINNYA";
export type StatusPerawatan = "TERJADWAL" | "SELESAI" | "DIBATALKAN";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Pd {
  id: number;
  kode: string;
  nama: string;
  singkatan: string | null;
  alamat: string | null;
  telepon: string | null;
  aktif: boolean;
  jumlahPns?: number;
  jumlahKendaraan?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pns {
  id: number;
  nama: string;
  nip: string;
  jabatan: string;
  golongan: GolonganPns;
  email: string | null;
  telepon: string | null;
  aktif: boolean;
  pdId: number;
  pd: Pd;
  createdAt: string;
  updatedAt: string;
}

export interface Kendaraan {
  id: number;
  nopol: string;
  merek: string;
  tipe: string;
  tahun: number;
  warna: string;
  kondisi: KondisiKendaraan;
  status: StatusKendaraan;
  nomorRangka: string | null;
  nomorMesin: string | null;
  odometer: number;
  tanggalPajak: string | null;
  catatan: string | null;
  pdId: number | null;
  pd: Pd | null;
  penugasanAktif?: PenugasanKendaraan | null;
  riwayatKondisiTerbaru?: RiwayatKondisi | null;
  createdAt: string;
  updatedAt: string;
}

export interface PenugasanKendaraan {
  id: number;
  kendaraanId: number;
  kendaraan?: Kendaraan;
  pnsId: number;
  pns?: Pns;
  peran: PeranPenugasan;
  tanggalMulai: string;
  tanggalSelesai: string | null;
  status: StatusPenugasan;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Perawatan {
  id: number;
  kendaraanId: number;
  kendaraan?: Kendaraan;
  jenis: JenisPerawatan;
  tanggal: string;
  deskripsi: string;
  bengkel: string | null;
  biaya: number;
  odometer: number | null;
  status: StatusPerawatan;
  createdAt: string;
  updatedAt: string;
}

export interface RiwayatKondisi {
  id: number;
  kendaraanId: number;
  kendaraan?: Kendaraan;
  kondisi: KondisiKendaraan;
  tanggal: string;
  keterangan: string | null;
  dicatatOleh: string | null;
  createdAt: string;
}

export interface StatistikKendaraan {
  total: number;
  byKondisi: Record<KondisiKendaraan, number>;
  byStatus: Record<StatusKendaraan, number>;
  perluPerhatian: number;
  pajakKedaluwarsa: number;
}

export interface KendaraanInput {
  nopol: string;
  merek: string;
  tipe: string;
  tahun: number;
  warna: string;
  kondisi?: KondisiKendaraan;
  status?: StatusKendaraan;
  nomorRangka?: string | null;
  nomorMesin?: string | null;
  odometer?: number;
  tanggalPajak?: string | null;
  pdId?: number;
  catatan?: string | null;
}

export interface PnsInput {
  nama: string;
  nip: string;
  jabatan: string;
  golongan: GolonganPns;
  pdId: number;
  email?: string | null;
  telepon?: string | null;
  aktif?: boolean;
}

export interface PdInput {
  kode: string;
  nama: string;
  singkatan?: string | null;
  alamat?: string | null;
  telepon?: string | null;
  aktif?: boolean;
}

export interface PenugasanInput {
  kendaraanId: number;
  pnsId: number;
  peran?: PeranPenugasan;
  tanggalMulai: string;
  tanggalSelesai?: string | null;
  status?: StatusPenugasan;
  catatan?: string | null;
}

export interface PerawatanInput {
  kendaraanId: number;
  jenis: JenisPerawatan;
  tanggal: string;
  deskripsi: string;
  bengkel?: string | null;
  biaya?: number;
  odometer?: number | null;
  status?: StatusPerawatan;
}

export interface RiwayatKondisiInput {
  kondisi: KondisiKendaraan;
  tanggal?: string;
  keterangan?: string | null;
  dicatatOleh?: string | null;
}
