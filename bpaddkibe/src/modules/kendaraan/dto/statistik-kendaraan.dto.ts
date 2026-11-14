import { ApiProperty } from '@nestjs/swagger';

export class StatistikKendaraanDto {
  @ApiProperty({ description: 'Total kendaraan.', example: 10 })
  total: number;

  @ApiProperty({
    description: 'Jumlah kendaraan per kondisi.',
    example: {
      BAIK: 6,
      RUSAK_RINGAN: 2,
      RUSAK_BERAT: 1,
      DALAM_PERBAIKAN: 1,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  byKondisi: Record<string, number>;

  @ApiProperty({
    description: 'Jumlah kendaraan per status.',
    example: {
      TERSEDIA: 7,
      DIGUNAKAN: 2,
      PERBAIKAN: 1,
      NONAKTIF: 0,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  byStatus: Record<string, number>;

  @ApiProperty({
    description: 'Jumlah kendaraan yang kondisinya tidak BAIK.',
    example: 4,
  })
  perluPerhatian: number;

  @ApiProperty({
    description: 'Jumlah kendaraan dengan tanggal pajak sudah lewat.',
    example: 1,
  })
  pajakKedaluwarsa: number;
}
