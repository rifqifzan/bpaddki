import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  JENIS_PERAWATAN,
  STATUS_PERAWATAN,
  type JenisPerawatan,
  type StatusPerawatan,
} from '../../../common/constants/domain.constants.js';
import {
  Trim,
  TrimToNull,
} from '../../../common/decorators/transform.decorators.js';

export class CreatePerawatanDto {
  @ApiProperty({ description: 'ID kendaraan.', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'kendaraanId harus berupa bilangan bulat.' })
  @Min(1, { message: 'kendaraanId minimal 1.' })
  kendaraanId: number;

  @ApiProperty({
    description: 'Jenis perawatan.',
    enum: JENIS_PERAWATAN,
    example: 'SERVIS_RUTIN',
  })
  @IsIn(JENIS_PERAWATAN, {
    message: `jenis harus salah satu dari: ${JENIS_PERAWATAN.join(', ')}.`,
  })
  jenis: JenisPerawatan;

  @ApiProperty({
    description: 'Tanggal pelaksanaan/rencana perawatan (YYYY-MM-DD).',
    example: '2026-11-14',
  })
  @IsDateString({}, { message: 'tanggal harus berupa tanggal ISO 8601.' })
  tanggal: string;

  @ApiProperty({
    description: 'Deskripsi pekerjaan perawatan.',
    example: 'Servis rutin 10.000 km, ganti oli dan filter.',
    minLength: 3,
    maxLength: 1000,
  })
  @Trim()
  @IsString({ message: 'deskripsi harus berupa teks.' })
  @Length(3, 1000, { message: 'deskripsi harus terdiri dari 3-1000 karakter.' })
  deskripsi: string;

  @ApiPropertyOptional({
    description: 'Nama bengkel/penyedia jasa.',
    example: 'Auto2000 Cibinong',
    maxLength: 150,
  })
  @TrimToNull()
  @IsString({ message: 'bengkel harus berupa teks.' })
  @MaxLength(150, { message: 'bengkel maksimal 150 karakter.' })
  @IsOptional()
  bengkel?: string | null;

  @ApiPropertyOptional({
    description: 'Biaya perawatan (Rupiah).',
    example: 1250000,
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'biaya harus berupa angka dengan maksimal 2 desimal.' },
  )
  @Min(0, { message: 'biaya minimal 0.' })
  @Max(999_999_999_999, { message: 'biaya terlalu besar.' })
  @IsOptional()
  biaya?: number;

  @ApiPropertyOptional({
    description: 'Odometer kendaraan saat perawatan (km).',
    example: 45500,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'odometer harus berupa bilangan bulat.' })
  @Min(0, { message: 'odometer minimal 0.' })
  @IsOptional()
  odometer?: number | null;

  @ApiPropertyOptional({
    description: 'Status perawatan.',
    enum: STATUS_PERAWATAN,
    example: 'SELESAI',
    default: 'SELESAI',
  })
  @IsIn(STATUS_PERAWATAN, {
    message: `status harus salah satu dari: ${STATUS_PERAWATAN.join(', ')}.`,
  })
  @IsOptional()
  status?: StatusPerawatan;
}
