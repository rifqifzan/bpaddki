import { Kendaraan } from '../modules/kendaraan/entities/kendaraan.entity.js';
import { Pd } from '../modules/pd/entities/pd.entity.js';
import { PenugasanKendaraan } from '../modules/penugasan/entities/penugasan-kendaraan.entity.js';
import { Perawatan } from '../modules/perawatan/entities/perawatan.entity.js';
import { Pns } from '../modules/pns/entities/pns.entity.js';
import { RiwayatKondisi } from '../modules/riwayat-kondisi/entities/riwayat-kondisi.entity.js';

export const ALL_ENTITIES = [
  Pd,
  Pns,
  Kendaraan,
  PenugasanKendaraan,
  RiwayatKondisi,
  Perawatan,
];
