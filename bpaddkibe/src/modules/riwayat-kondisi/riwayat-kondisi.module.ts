import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiwayatKondisi } from './entities/riwayat-kondisi.entity.js';
import { RiwayatKondisiController } from './riwayat-kondisi.controller.js';
import { RiwayatKondisiService } from './riwayat-kondisi.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([RiwayatKondisi])],
  controllers: [RiwayatKondisiController],
  providers: [RiwayatKondisiService],
})
export class RiwayatKondisiModule {}
