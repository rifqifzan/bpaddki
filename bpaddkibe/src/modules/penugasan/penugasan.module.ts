import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PenugasanKendaraan } from './entities/penugasan-kendaraan.entity.js';
import { PenugasanController } from './penugasan.controller.js';
import { PenugasanService } from './penugasan.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([PenugasanKendaraan])],
  controllers: [PenugasanController],
  providers: [PenugasanService],
})
export class PenugasanModule {}
