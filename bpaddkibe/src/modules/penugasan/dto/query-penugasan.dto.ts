import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import {
  PERAN_PENUGASAN,
  STATUS_PENUGASAN,
  type PeranPenugasan,
  type StatusPenugasan,
} from '../../../common/constants/domain.constants.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

class PenugasanFilterDto {
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
    description: 'Filter berdasarkan ID PNS.',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'pnsId harus berupa bilangan bulat.' })
  @Min(1, { message: 'pnsId minimal 1.' })
  @IsOptional()
  pnsId?: number;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status penugasan.',
    enum: STATUS_PENUGASAN,
    example: 'AKTIF',
  })
  @IsIn(STATUS_PENUGASAN, {
    message: `status harus salah satu dari: ${STATUS_PENUGASAN.join(', ')}.`,
  })
  @IsOptional()
  status?: StatusPenugasan;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan peran.',
    enum: PERAN_PENUGASAN,
    example: 'PENANGGUNG_JAWAB',
  })
  @IsIn(PERAN_PENUGASAN, {
    message: `peran harus salah satu dari: ${PERAN_PENUGASAN.join(', ')}.`,
  })
  @IsOptional()
  peran?: PeranPenugasan;

  @ApiPropertyOptional({
    description: 'Kolom pengurutan.',
    enum: ['tanggalMulai', 'tanggalSelesai', 'status', 'createdAt'],
    default: 'tanggalMulai',
  })
  @IsIn(['tanggalMulai', 'tanggalSelesai', 'status', 'createdAt'], {
    message:
      'sortBy harus salah satu dari: tanggalMulai, tanggalSelesai, status, createdAt.',
  })
  @IsOptional()
  sortBy: 'tanggalMulai' | 'tanggalSelesai' | 'status' | 'createdAt' =
    'tanggalMulai';
}

export class QueryPenugasanDto extends IntersectionType(
  PaginationQueryDto,
  PenugasanFilterDto,
) {}
