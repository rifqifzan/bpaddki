import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  PERAN_PENUGASAN,
  STATUS_PENUGASAN,
  type PeranPenugasan,
  type StatusPenugasan,
} from '../../../common/constants/domain.constants.js';
import { TrimToNull } from '../../../common/decorators/transform.decorators.js';

export class UpdatePenugasanDto {
  @ApiPropertyOptional({
    description: 'Peran PNS pada penugasan.',
    enum: PERAN_PENUGASAN,
    example: 'PENANGGUNG_JAWAB',
  })
  @IsIn(PERAN_PENUGASAN, {
    message: `peran harus salah satu dari: ${PERAN_PENUGASAN.join(', ')}.`,
  })
  @IsOptional()
  peran?: PeranPenugasan;

  @ApiPropertyOptional({
    description: 'Tanggal mulai penugasan (YYYY-MM-DD).',
    example: '2026-01-01',
  })
  @IsDateString({}, { message: 'tanggalMulai harus berupa tanggal ISO 8601.' })
  @IsOptional()
  tanggalMulai?: string;

  @ApiPropertyOptional({
    description: 'Tanggal selesai penugasan (YYYY-MM-DD).',
    example: '2026-12-31',
    nullable: true,
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
    example: 'SELESAI',
  })
  @IsIn(STATUS_PENUGASAN, {
    message: `status harus salah satu dari: ${STATUS_PENUGASAN.join(', ')}.`,
  })
  @IsOptional()
  status?: StatusPenugasan;

  @ApiPropertyOptional({
    description: 'Catatan penugasan.',
    example: 'Penugasan diakhiri karena mutasi.',
    maxLength: 1000,
    nullable: true,
  })
  @TrimToNull()
  @IsString({ message: 'catatan harus berupa teks.' })
  @MaxLength(1000, { message: 'catatan maksimal 1000 karakter.' })
  @IsOptional()
  catatan?: string | null;
}
