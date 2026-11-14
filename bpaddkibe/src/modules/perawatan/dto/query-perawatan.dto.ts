import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import {
  JENIS_PERAWATAN,
  STATUS_PERAWATAN,
  type JenisPerawatan,
  type StatusPerawatan,
} from '../../../common/constants/domain.constants.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

class PerawatanFilterDto {
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
    description: 'Filter berdasarkan jenis perawatan.',
    enum: JENIS_PERAWATAN,
    example: 'SERVIS_RUTIN',
  })
  @IsIn(JENIS_PERAWATAN, {
    message: `jenis harus salah satu dari: ${JENIS_PERAWATAN.join(', ')}.`,
  })
  @IsOptional()
  jenis?: JenisPerawatan;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status perawatan.',
    enum: STATUS_PERAWATAN,
    example: 'SELESAI',
  })
  @IsIn(STATUS_PERAWATAN, {
    message: `status harus salah satu dari: ${STATUS_PERAWATAN.join(', ')}.`,
  })
  @IsOptional()
  status?: StatusPerawatan;

  @ApiPropertyOptional({
    description: 'Batas awal tanggal perawatan (YYYY-MM-DD).',
    example: '2026-01-01',
  })
  @IsDateString({}, { message: 'from harus berupa tanggal ISO 8601.' })
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'Batas akhir tanggal perawatan (YYYY-MM-DD).',
    example: '2026-12-31',
  })
  @IsDateString({}, { message: 'to harus berupa tanggal ISO 8601.' })
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    description: 'Kolom pengurutan.',
    enum: ['tanggal', 'biaya', 'createdAt'],
    default: 'tanggal',
  })
  @IsIn(['tanggal', 'biaya', 'createdAt'], {
    message: 'sortBy harus salah satu dari: tanggal, biaya, createdAt.',
  })
  @IsOptional()
  sortBy: 'tanggal' | 'biaya' | 'createdAt' = 'tanggal';
}

export class QueryPerawatanDto extends IntersectionType(
  PaginationQueryDto,
  PerawatanFilterDto,
) {}
