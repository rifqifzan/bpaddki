import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { StringToBoolean } from '../../../common/decorators/transform.decorators.js';

class PdFilterDto {
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
    enum: ['kode', 'nama', 'singkatan', 'createdAt'],
    default: 'nama',
  })
  @IsIn(['kode', 'nama', 'singkatan', 'createdAt'], {
    message: 'sortBy harus salah satu dari: kode, nama, singkatan, createdAt.',
  })
  @IsOptional()
  sortBy: 'kode' | 'nama' | 'singkatan' | 'createdAt' = 'nama';
}

export class QueryPdDto extends IntersectionType(
  PaginationQueryDto,
  PdFilterDto,
) {}
