import type {
  GolonganPns,
  JenisPerawatan,
  KondisiKendaraan,
  PeranPenugasan,
  StatusKendaraan,
  StatusPenugasan,
  StatusPerawatan,
} from "./types";

export type Tone = "zinc" | "emerald" | "amber" | "red" | "blue" | "violet";

export const kondisiLabels: Record<KondisiKendaraan, string> = {
  BAIK: "Baik",
  RUSAK_RINGAN: "Rusak ringan",
  RUSAK_BERAT: "Rusak berat",
  DALAM_PERBAIKAN: "Dalam perbaikan",
};

export const kondisiTones: Record<KondisiKendaraan, Tone> = {
  BAIK: "emerald",
  RUSAK_RINGAN: "amber",
  RUSAK_BERAT: "red",
  DALAM_PERBAIKAN: "blue",
};

export const statusKendaraanLabels: Record<StatusKendaraan, string> = {
  TERSEDIA: "Tersedia",
  DIGUNAKAN: "Digunakan",
  PERBAIKAN: "Perbaikan",
  NONAKTIF: "Nonaktif",
};

export const statusKendaraanTones: Record<StatusKendaraan, Tone> = {
  TERSEDIA: "emerald",
  DIGUNAKAN: "blue",
  PERBAIKAN: "amber",
  NONAKTIF: "zinc",
};

export const peranLabels: Record<PeranPenugasan, string> = {
  PENANGGUNG_JAWAB: "Penanggung jawab",
  PENGEMUDI: "Pengemudi",
};

export const statusPenugasanLabels: Record<StatusPenugasan, string> = {
  AKTIF: "Aktif",
  SELESAI: "Selesai",
};

export const statusPenugasanTones: Record<StatusPenugasan, Tone> = {
  AKTIF: "blue",
  SELESAI: "zinc",
};

export const jenisPerawatanLabels: Record<JenisPerawatan, string> = {
  SERVIS_RUTIN: "Servis rutin",
  PERBAIKAN: "Perbaikan",
  GANTI_OLI: "Ganti oli",
  PAJAK: "Pajak",
  LAINNYA: "Lainnya",
};

export const statusPerawatanLabels: Record<StatusPerawatan, string> = {
  TERJADWAL: "Terjadwal",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

export const statusPerawatanTones: Record<StatusPerawatan, Tone> = {
  TERJADWAL: "amber",
  SELESAI: "emerald",
  DIBATALKAN: "red",
};

export const golonganOptions: GolonganPns[] = [
  "I/a",
  "I/b",
  "I/c",
  "I/d",
  "II/a",
  "II/b",
  "II/c",
  "II/d",
  "III/a",
  "III/b",
  "III/c",
  "III/d",
  "IV/a",
  "IV/b",
  "IV/c",
  "IV/d",
  "IV/e",
];

export const kondisiOptions = Object.keys(kondisiLabels) as KondisiKendaraan[];
export const statusKendaraanOptions = Object.keys(
  statusKendaraanLabels,
) as StatusKendaraan[];
export const peranOptions = Object.keys(peranLabels) as PeranPenugasan[];
export const statusPenugasanOptions = Object.keys(
  statusPenugasanLabels,
) as StatusPenugasan[];
export const jenisPerawatanOptions = Object.keys(
  jenisPerawatanLabels,
) as JenisPerawatan[];
export const statusPerawatanOptions = Object.keys(
  statusPerawatanLabels,
) as StatusPerawatan[];

export const toneClasses: Record<Tone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};
