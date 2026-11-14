import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  KONDISI_KENDARAAN,
  STATUS_KENDARAAN,
  type KondisiKendaraan,
  type StatusKendaraan,
} from '../../../common/constants/domain.constants.js';
import {
  NormalizeNopol,
  Trim,
  TrimToNull,
} from '../../../common/decorators/transform.decorators.js';

const CURRENT_YEAR = new Date().getFullYear();

export class CreateKendaraanDto {
  @ApiProperty({
    description: 'Nomor polisi kendaraan.',
    example: 'B 1234 XYZ',
    maxLength: 20,
  })
  @NormalizeNopol()
  @IsString({ message: 'nopol harus berupa teks.' })
  @Matches(/^[A-Z]{1,2} \d{1,4}( [A-Z]{1,3})?$/, {
    message:
      'nopol tidak valid. Contoh format yang benar: B 1234 XYZ atau AB 1234 CD.',
  })
  nopol: string;

  @ApiProperty({
    description: 'Merek kendaraan.',
    example: 'Toyota',
    minLength: 2,
    maxLength: 50,
  })
  @Trim()
  @IsString({ message: 'merek harus berupa teks.' })
  @Length(2, 50, { message: 'merek harus terdiri dari 2-50 karakter.' })
  merek: string;

  @ApiProperty({
    description: 'Tipe/model kendaraan.',
    example: 'Innova Zenix',
    minLength: 1,
    maxLength: 50,
  })
  @Trim()
  @IsString({ message: 'tipe harus berupa teks.' })
  @Length(1, 50, { message: 'tipe harus terdiri dari 1-50 karakter.' })
  tipe: string;

  @ApiProperty({
    description: 'Tahun pembuatan kendaraan.',
    example: 2023,
    minimum: 1900,
    maximum: CURRENT_YEAR + 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'tahun harus berupa bilangan bulat.' })
  @Min(1900, { message: 'tahun minimal 1900.' })
  @Max(CURRENT_YEAR + 1, {
    message: `tahun maksimal ${CURRENT_YEAR + 1}.`,
  })
  tahun: number;

  @ApiProperty({
    description: 'Warna kendaraan.',
    example: 'Hitam',
    minLength: 3,
    maxLength: 30,
  })
  @Trim()
  @IsString({ message: 'warna harus berupa teks.' })
  @Length(3, 30, { message: 'warna harus terdiri dari 3-30 karakter.' })
  warna: string;

  @ApiPropertyOptional({
    description: 'Kondisi kendaraan saat ini.',
    enum: KONDISI_KENDARAAN,
    example: 'BAIK',
    default: 'BAIK',
  })
  @IsIn(KONDISI_KENDARAAN, {
    message: `kondisi harus salah satu dari: ${KONDISI_KENDARAAN.join(', ')}.`,
  })
  @IsOptional()
  kondisi?: KondisiKendaraan;

  @ApiPropertyOptional({
    description: 'Status operasional kendaraan.',
    enum: STATUS_KENDARAAN,
    example: 'TERSEDIA',
    default: 'TERSEDIA',
  })
  @IsIn(STATUS_KENDARAAN, {
    message: `status harus salah satu dari: ${STATUS_KENDARAAN.join(', ')}.`,
  })
  @IsOptional()
  status?: StatusKendaraan;

  @ApiPropertyOptional({
    description: 'Nomor rangka kendaraan.',
    example: 'MHFXXXXX123456789',
    maxLength: 50,
  })
  @TrimToNull()
  @IsString({ message: 'nomorRangka harus berupa teks.' })
  @MaxLength(50, { message: 'nomorRangka maksimal 50 karakter.' })
  @IsOptional()
  nomorRangka?: string | null;

  @ApiPropertyOptional({
    description: 'Nomor mesin kendaraan.',
    example: '2GD1234567',
    maxLength: 50,
  })
  @TrimToNull()
  @IsString({ message: 'nomorMesin harus berupa teks.' })
  @MaxLength(50, { message: 'nomorMesin maksimal 50 karakter.' })
  @IsOptional()
  nomorMesin?: string | null;

  @ApiPropertyOptional({
    description: 'Odometer terakhir (km).',
    example: 45000,
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'odometer harus berupa bilangan bulat.' })
  @Min(0, { message: 'odometer minimal 0.' })
  @IsOptional()
  odometer?: number;

  @ApiPropertyOptional({
    description: 'Tanggal jatuh tempo pajak (YYYY-MM-DD).',
    example: '2027-03-31',
  })
  @IsDateString({}, { message: 'tanggalPajak harus berupa tanggal ISO 8601.' })
  @IsOptional()
  tanggalPajak?: string | null;

  @ApiPropertyOptional({
    description: 'ID Perangkat Daerah pengelola kendaraan.',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'pdId harus berupa bilangan bulat.' })
  @Min(1, { message: 'pdId minimal 1.' })
  @IsOptional()
  pdId?: number;

  @ApiPropertyOptional({
    description: 'Catatan tambahan.',
    example: 'Kendaraan operasional pimpinan.',
    maxLength: 1000,
  })
  @TrimToNull()
  @IsString({ message: 'catatan harus berupa teks.' })
  @MaxLength(1000, { message: 'catatan maksimal 1000 karakter.' })
  @IsOptional()
  catatan?: string | null;
}
