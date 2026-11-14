import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perawatan } from './entities/perawatan.entity.js';
import { PerawatanController } from './perawatan.controller.js';
import { PerawatanService } from './perawatan.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Perawatan])],
  controllers: [PerawatanController],
  providers: [PerawatanService],
})
export class PerawatanModule {}
