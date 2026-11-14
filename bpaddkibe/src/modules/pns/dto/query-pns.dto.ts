import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Min } from 'class-validator';
import {
  GOLONGAN_PNS,
  type GolonganPns,
} from '../../../common/constants/domain.constants.js';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { StringToBoolean } from '../../../common/decorators/transform.decorators.js';

class PnsFilterDto {
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
    description: 'Filter berdasarkan golongan.',
    enum: GOLONGAN_PNS,
    example: 'III/c',
  })
  @IsIn(GOLONGAN_PNS, {
    message: `golongan harus salah satu dari: ${GOLONGAN_PNS.join(', ')}.`,
  })
  @IsOptional()
  golongan?: GolonganPns;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status aktif.',
    example: true,
  })
  @StringToBoolean()
  @IsBoolean({ message: 'aktif harus berupa boolean.' })
  @IsOptional()
  aktif?: boolean;

  @ApiPropertyOptional({
    description: 'Kolom pengurutan.',
    enum: ['nama', 'nip', 'jabatan', 'golongan', 'createdAt'],
    default: 'nama',
  })
  @IsIn(['nama', 'nip', 'jabatan', 'golongan', 'createdAt'], {
    message:
      'sortBy harus salah satu dari: nama, nip, jabatan, golongan, createdAt.',
  })
  @IsOptional()
  sortBy: 'nama' | 'nip' | 'jabatan' | 'golongan' | 'createdAt' = 'nama';
}

export class QueryPnsDto extends IntersectionType(
  PaginationQueryDto,
  PnsFilterDto,
) {}
