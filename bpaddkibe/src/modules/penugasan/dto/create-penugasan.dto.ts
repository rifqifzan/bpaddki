import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  PERAN_PENUGASAN,
  STATUS_PENUGASAN,
  type PeranPenugasan,
  type StatusPenugasan,
} from '../../../common/constants/domain.constants.js';
import { TrimToNull } from '../../../common/decorators/transform.decorators.js';

export class CreatePenugasanDto {
  @ApiProperty({ description: 'ID kendaraan.', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'kendaraanId harus berupa bilangan bulat.' })
  @Min(1, { message: 'kendaraanId minimal 1.' })
  kendaraanId: number;

  @ApiProperty({
    description: 'ID PNS yang bertanggung jawab/mengemudikan kendaraan.',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'pnsId harus berupa bilangan bulat.' })
  @Min(1, { message: 'pnsId minimal 1.' })
  pnsId: number;

  @ApiPropertyOptional({
    description: 'Peran PNS pada penugasan.',
    enum: PERAN_PENUGASAN,
    example: 'PENANGGUNG_JAWAB',
    default: 'PENANGGUNG_JAWAB',
  })
  @IsIn(PERAN_PENUGASAN, {
    message: `peran harus salah satu dari: ${PERAN_PENUGASAN.join(', ')}.`,
  })
  @IsOptional()
  peran?: PeranPenugasan;

  @ApiProperty({
    description: 'Tanggal mulai penugasan (YYYY-MM-DD).',
    example: '2026-01-01',
  })
  @IsDateString({}, { message: 'tanggalMulai harus berupa tanggal ISO 8601.' })
  tanggalMulai: string;

  @ApiPropertyOptional({
    description: 'Tanggal selesai penugasan (YYYY-MM-DD).',
    example: '2026-12-31',
  })
  @IsDateString(
    {},
    { message: 'tanggalSelesai harus berupa tanggal ISO 8601.' },
  )
  @IsOptional()
  tanggalSelesai?: string | null;

  @ApiPropertyOptional({
    description: 'Status penugasan.',
    enum: STATUS_PENUGASAN,
    example: 'AKTIF',
    default: 'AKTIF',
  })
  @IsIn(STATUS_PENUGASAN, {
    message: `status harus salah satu dari: ${STATUS_PENUGASAN.join(', ')}.`,
  })
  @IsOptional()
  status?: StatusPenugasan;

  @ApiPropertyOptional({
    description: 'Catatan penugasan.',
    example: 'Penanggung jawab harian kendaraan operasional.',
    maxLength: 1000,
  })
  @TrimToNull()
  @IsString({ message: 'catatan harus berupa teks.' })
  @MaxLength(1000, { message: 'catatan maksimal 1000 karakter.' })
  @IsOptional()
  catatan?: string | null;
}
