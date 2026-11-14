import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  KONDISI_KENDARAAN,
  type KondisiKendaraan,
} from '../../../common/constants/domain.constants.js';
import { TrimToNull } from '../../../common/decorators/transform.decorators.js';

export class CreateRiwayatKondisiDto {
  @ApiProperty({
    description: 'Kondisi kendaraan yang dicatat.',
    enum: KONDISI_KENDARAAN,
    example: 'RUSAK_RINGAN',
  })
  @IsIn(KONDISI_KENDARAAN, {
    message: `kondisi harus salah satu dari: ${KONDISI_KENDARAAN.join(', ')}.`,
  })
  kondisi: KondisiKendaraan;

  @ApiPropertyOptional({
    description: 'Tanggal pencatatan (YYYY-MM-DD). Default: hari ini.',
    example: '2026-11-14',
  })
  @IsDateString({}, { message: 'tanggal harus berupa tanggal ISO 8601.' })
  @IsOptional()
  tanggal?: string;

  @ApiPropertyOptional({
    description: 'Keterangan kondisi/perubahan.',
    example: 'Lampu depan kanan mati.',
    maxLength: 1000,
  })
  @TrimToNull()
  @IsString({ message: 'keterangan harus berupa teks.' })
  @MaxLength(1000, { message: 'keterangan maksimal 1000 karakter.' })
  @IsOptional()
  keterangan?: string | null;

  @ApiPropertyOptional({
    description: 'Nama petugas yang mencatat.',
    example: 'Siti Aminah',
    maxLength: 100,
  })
  @TrimToNull()
  @IsString({ message: 'dicatatOleh harus berupa teks.' })
  @MaxLength(100, { message: 'dicatatOleh maksimal 100 karakter.' })
  @IsOptional()
  dicatatOleh?: string | null;
}
