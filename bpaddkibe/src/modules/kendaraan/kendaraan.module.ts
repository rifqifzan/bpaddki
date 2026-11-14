import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pd } from '../pd/entities/pd.entity.js';
import { PenugasanKendaraan } from '../penugasan/entities/penugasan-kendaraan.entity.js';
import { RiwayatKondisi } from '../riwayat-kondisi/entities/riwayat-kondisi.entity.js';
import { Kendaraan } from './entities/kendaraan.entity.js';
import { KendaraanController } from './kendaraan.controller.js';
import { KendaraanService } from './kendaraan.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kendaraan,
      Pd,
      PenugasanKendaraan,
      RiwayatKondisi,
    ]),
  ],
  controllers: [KendaraanController],
  providers: [KendaraanService],
})
export class KendaraanModule {}
