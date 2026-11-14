import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import {
  KONDISI_KENDARAAN,
  type KondisiKendaraan,
} from '../../../common/constants/domain.constants.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

class RiwayatKondisiFilterDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID kendaraan.',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'kendaraanId harus berupa bilangan bulat.' })
  @Min(1, { message: 'kendaraanId minimal 1.' })
  @IsOptional()
  kendaraanId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan kondisi.',
    enum: KONDISI_KENDARAAN,
    example: 'RUSAK_RINGAN',
  })
  @IsIn(KONDISI_KENDARAAN, {
    message: `kondisi harus salah satu dari: ${KONDISI_KENDARAAN.join(', ')}.`,
  })
  @IsOptional()
  kondisi?: KondisiKendaraan;

  @ApiPropertyOptional({
    description: 'Batas awal tanggal pencatatan (YYYY-MM-DD).',
    example: '2026-01-01',
  })
  @IsDateString({}, { message: 'from harus berupa tanggal ISO 8601.' })
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'Batas akhir tanggal pencatatan (YYYY-MM-DD).',
    example: '2026-12-31',
  })
  @IsDateString({}, { message: 'to harus berupa tanggal ISO 8601.' })
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    description: 'Kolom pengurutan.',
    enum: ['tanggal', 'createdAt'],
    default: 'tanggal',
  })
  @IsIn(['tanggal', 'createdAt'], {
    message: 'sortBy harus salah satu dari: tanggal, createdAt.',
  })
  @IsOptional()
  sortBy: 'tanggal' | 'createdAt' = 'tanggal';
}

export class QueryRiwayatKondisiDto extends IntersectionType(
  PaginationQueryDto,
  RiwayatKondisiFilterDto,
) {}
