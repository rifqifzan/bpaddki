import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Nomor halaman (dimulai dari 1).',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'page harus berupa bilangan bulat.' })
  @Min(1, { message: 'page minimal 1.' })
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Jumlah data per halaman (maksimal 100).',
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @Type(() => Number)
  @IsInt({ message: 'limit harus berupa bilangan bulat.' })
  @Min(1, { message: 'limit minimal 1.' })
  @Max(100, { message: 'limit maksimal 100.' })
  @IsOptional()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Kata kunci pencarian.',
    maxLength: 100,
    example: 'toyota',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'search harus berupa teks.' })
  @MaxLength(100, { message: 'search maksimal 100 karakter.' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Arah pengurutan.',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder harus bernilai asc atau desc.',
  })
  @IsOptional()
  sortOrder: 'asc' | 'desc' = 'desc';
}
