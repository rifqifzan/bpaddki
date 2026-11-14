import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  GOLONGAN_PNS,
  type GolonganPns,
} from '../../../common/constants/domain.constants.js';
import {
  LowerTrim,
  Trim,
  TrimToNull,
} from '../../../common/decorators/transform.decorators.js';

export class CreatePnsDto {
  @ApiProperty({
    description: 'Nama lengkap PNS.',
    example: 'Budi Santoso',
    minLength: 3,
    maxLength: 150,
  })
  @Trim()
  @IsString({ message: 'nama harus berupa teks.' })
  @Length(3, 150, { message: 'nama harus terdiri dari 3-150 karakter.' })
  nama: string;

  @ApiProperty({
    description: 'NIP (18 digit angka).',
    example: '197812312005011001',
    minLength: 18,
    maxLength: 18,
  })
  @Trim()
  @IsString({ message: 'nip harus berupa teks.' })
  @Matches(/^\d{18}$/, {
    message: 'nip harus terdiri dari tepat 18 digit angka.',
  })
  nip: string;

  @ApiProperty({
    description: 'Jabatan PNS.',
    example: 'Kepala Sub Bagian Umum',
    minLength: 2,
    maxLength: 100,
  })
  @Trim()
  @IsString({ message: 'jabatan harus berupa teks.' })
  @Length(2, 100, { message: 'jabatan harus terdiri dari 2-100 karakter.' })
  jabatan: string;

  @ApiProperty({
    description: 'Golongan PNS.',
    enum: GOLONGAN_PNS,
    example: 'III/c',
  })
  @IsIn(GOLONGAN_PNS, {
    message: `golongan harus salah satu dari: ${GOLONGAN_PNS.join(', ')}.`,
  })
  golongan: GolonganPns;

  @ApiProperty({
    description: 'ID Perangkat Daerah tempat PNS bertugas.',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'pdId harus berupa bilangan bulat.' })
  @Min(1, { message: 'pdId minimal 1.' })
  pdId: number;

  @ApiPropertyOptional({
    description: 'Email PNS.',
    example: 'budi.santoso@example.go.id',
    maxLength: 150,
  })
  @LowerTrim()
  @IsEmail({}, { message: 'email tidak valid.' })
  @MaxLength(150, { message: 'email maksimal 150 karakter.' })
  @IsOptional()
  email?: string | null;

  @ApiPropertyOptional({
    description: 'Nomor telepon/HP.',
    example: '081234567890',
    maxLength: 30,
  })
  @TrimToNull()
  @IsString({ message: 'telepon harus berupa teks.' })
  @Matches(/^[0-9+()\-\s]{6,30}$/, {
    message: 'telepon tidak valid.',
  })
  @IsOptional()
  telepon?: string | null;

  @ApiPropertyOptional({
    description: 'Status aktif PNS.',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'aktif harus berupa boolean.' })
  @IsOptional()
  aktif?: boolean;
}
