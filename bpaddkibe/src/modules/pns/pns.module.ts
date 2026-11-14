import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenugasanKendaraan } from '../penugasan/entities/penugasan-kendaraan.entity.js';
import { Pd } from '../pd/entities/pd.entity.js';
import { Pns } from './entities/pns.entity.js';
import { PnsController } from './pns.controller.js';
import { PnsService } from './pns.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Pns, Pd, PenugasanKendaraan])],
  controllers: [PnsController],
  providers: [PnsService],
})
export class PnsModule {}
