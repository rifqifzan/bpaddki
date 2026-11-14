export const KONDISI_KENDARAAN = [
  'BAIK',
  'RUSAK_RINGAN',
  'RUSAK_BERAT',
  'DALAM_PERBAIKAN',
] as const;
export type KondisiKendaraan = (typeof KONDISI_KENDARAAN)[number];

export const STATUS_KENDARAAN = [
  'TERSEDIA',
  'DIGUNAKAN',
  'PERBAIKAN',
  'NONAKTIF',
] as const;
export type StatusKendaraan = (typeof STATUS_KENDARAAN)[number];

export const GOLONGAN_PNS = [
  'I/a',
  'I/b',
  'I/c',
  'I/d',
  'II/a',
  'II/b',
  'II/c',
  'II/d',
  'III/a',
  'III/b',
  'III/c',
  'III/d',
  'IV/a',
  'IV/b',
  'IV/c',
  'IV/d',
  'IV/e',
] as const;
export type GolonganPns = (typeof GOLONGAN_PNS)[number];

export const PERAN_PENUGASAN = ['PENANGGUNG_JAWAB', 'PENGEMUDI'] as const;
export type PeranPenugasan = (typeof PERAN_PENUGASAN)[number];

export const STATUS_PENUGASAN = ['AKTIF', 'SELESAI'] as const;
export type StatusPenugasan = (typeof STATUS_PENUGASAN)[number];

export const JENIS_PERAWATAN = [
  'SERVIS_RUTIN',
  'PERBAIKAN',
  'GANTI_OLI',
  'PAJAK',
  'LAINNYA',
] as const;
export type JenisPerawatan = (typeof JENIS_PERAWATAN)[number];

export const STATUS_PERAWATAN = ['TERJADWAL', 'SELESAI', 'DIBATALKAN'] as const;
export type StatusPerawatan = (typeof STATUS_PERAWATAN)[number];
