import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import {
  KONDISI_KENDARAAN,
  STATUS_KENDARAAN,
  type KondisiKendaraan,
  type StatusKendaraan,
} from '../../../common/constants/domain.constants.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

class KendaraanFilterDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan kondisi kendaraan.',
    enum: KONDISI_KENDARAAN,
    example: 'BAIK',
  })
  @IsIn(KONDISI_KENDARAAN, {
    message: `kondisi harus salah satu dari: ${KONDISI_KENDARAAN.join(', ')}.`,
  })
  @IsOptional()
  kondisi?: KondisiKendaraan;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status kendaraan.',
    enum: STATUS_KENDARAAN,
    example: 'TERSEDIA',
  })
  @IsIn(STATUS_KENDARAAN, {
    message: `status harus salah satu dari: ${STATUS_KENDARAAN.join(', ')}.`,
  })
  @IsOptional()
  status?: StatusKendaraan;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID Perangkat Daerah.',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'pdId harus berupa bilangan bulat.' })
  @Min(1, { message: 'pdId minimal 1.' })
  @IsOptional()
  pdId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tahun pembuatan.',
    example: 2023,
  })
  @Type(() => Number)
  @IsInt({ message: 'tahun harus berupa bilangan bulat.' })
  @Min(1900, { message: 'tahun minimal 1900.' })
  @IsOptional()
  tahun?: number;

  @ApiPropertyOptional({
    description: 'Kolom pengurutan.',
    enum: ['nopol', 'merek', 'tipe', 'tahun', 'kondisi', 'status', 'createdAt'],
    default: 'createdAt',
  })
  @IsIn(['nopol', 'merek', 'tipe', 'tahun', 'kondisi', 'status', 'createdAt'], {
    message:
      'sortBy harus salah satu dari: nopol, merek, tipe, tahun, kondisi, status, createdAt.',
  })
  @IsOptional()
  sortBy:
    'nopol' | 'merek' | 'tipe' | 'tahun' | 'kondisi' | 'status' | 'createdAt' =
    'createdAt';
}

export class QueryKendaraanDto extends IntersectionType(
  PaginationQueryDto,
  KendaraanFilterDto,
) {}
