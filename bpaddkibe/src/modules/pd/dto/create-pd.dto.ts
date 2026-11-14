import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  Trim,
  TrimToNull,
  UpperTrim,
} from '../../../common/decorators/transform.decorators.js';

export class CreatePdDto {
  @ApiProperty({
    description: 'Kode unik PD (huruf kapital, angka, atau tanda hubung).',
    example: 'DISDIK',
    minLength: 2,
    maxLength: 20,
  })
  @UpperTrim()
  @IsString({ message: 'kode harus berupa teks.' })
  @Length(2, 20, { message: 'kode harus terdiri dari 2-20 karakter.' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'kode hanya boleh berisi huruf, angka, dan tanda hubung.',
  })
  kode: string;

  @ApiProperty({
    description: 'Nama lengkap Perangkat Daerah.',
    example: 'Dinas Pendidikan',
    minLength: 3,
    maxLength: 150,
  })
  @Trim()
  @IsString({ message: 'nama harus berupa teks.' })
  @Length(3, 150, { message: 'nama harus terdiri dari 3-150 karakter.' })
  nama: string;

  @ApiPropertyOptional({
    description: 'Singkatan/nama pendek PD.',
    example: 'DPendidikan',
    maxLength: 50,
  })
  @TrimToNull()
  @IsString({ message: 'singkatan harus berupa teks.' })
  @MaxLength(50, { message: 'singkatan maksimal 50 karakter.' })
  @IsOptional()
  singkatan?: string | null;

  @ApiPropertyOptional({
    description: 'Alamat kantor PD.',
    example: 'Jl. Pendidikan No. 1, Jakarta',
    maxLength: 255,
  })
  @TrimToNull()
  @IsString({ message: 'alamat harus berupa teks.' })
  @MaxLength(255, { message: 'alamat maksimal 255 karakter.' })
  @IsOptional()
  alamat?: string | null;

  @ApiPropertyOptional({
    description: 'Nomor telepon kantor.',
    example: '021-1234567',
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
    description: 'Status aktif PD.',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'aktif harus berupa boolean.' })
  @IsOptional()
  aktif?: boolean;
}
