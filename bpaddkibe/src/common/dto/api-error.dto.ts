import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Validasi gagal.' })
  message: string;

  @ApiPropertyOptional({
    description: 'Rincian kesalahan validasi atau penyebab konflik.',
    type: [String],
    example: ['nopol: nopol tidak boleh kosong.'],
  })
  details?: string[];

  @ApiProperty({ example: '/api/v1/kendaraan' })
  path: string;

  @ApiProperty({ example: 'POST' })
  method: string;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  timestamp: string;

  @ApiPropertyOptional({ example: '4b1f2f2e-7d1c-4d8e-9a4b-0d4f8a7c1e2f' })
  requestId?: string;
}
