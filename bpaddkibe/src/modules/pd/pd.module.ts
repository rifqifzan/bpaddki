import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kendaraan } from '../kendaraan/entities/kendaraan.entity.js';
import { Pns } from '../pns/entities/pns.entity.js';
import { Pd } from './entities/pd.entity.js';
import { PdController } from './pd.controller.js';
import { PdService } from './pd.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Pd, Pns, Kendaraan])],
  controllers: [PdController],
  providers: [PdService],
})
export class PdModule {}
