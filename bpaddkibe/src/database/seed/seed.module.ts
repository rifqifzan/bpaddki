import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ALL_ENTITIES } from '../entities.js';
import { SeedService } from './seed.service.js';

@Module({
  imports: [TypeOrmModule.forFeature(ALL_ENTITIES)],
  providers: [SeedService],
})
export class SeedModule {}
