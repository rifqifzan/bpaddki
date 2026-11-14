import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  KONDISI_KENDARAAN,
  STATUS_KENDARAAN,
  type KondisiKendaraan,
  type StatusKendaraan,
} from '../../../common/constants/domain.constants.js';
import { Pd } from '../../pd/entities/pd.entity.js';

@Entity('kendaraan')
@Index('idx_kendaraan_kondisi', ['kondisi'])
@Index('idx_kendaraan_status', ['status'])
@Index('idx_kendaraan_pd', ['pdId'])
@Index('idx_kendaraan_merek', ['merek'])
export class Kendaraan {
  @ApiProperty({ description: 'ID kendaraan.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nomor polisi kendaraan (dinormalisasi).',
    example: 'B 1234 XYZ',
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  nopol: string;

  @ApiProperty({ description: 'Merek kendaraan.', example: 'Toyota' })
  @Column({ type: 'varchar', length: 50 })
  merek: string;

  @ApiProperty({
    description: 'Tipe/model kendaraan.',
    example: 'Innova Zenix',
  })
  @Column({ type: 'varchar', length: 50 })
  tipe: string;

  @ApiProperty({
    description: 'Tahun pembuatan kendaraan.',
    example: 2023,
    minimum: 1900,
  })
  @Column({ type: 'int' })
  tahun: number;

  @ApiProperty({ description: 'Warna kendaraan.', example: 'Hitam' })
  @Column({ type: 'varchar', length: 30 })
  warna: string;

  @ApiProperty({
    description: 'Kondisi terkini kendaraan.',
    enum: KONDISI_KENDARAAN,
    example: 'BAIK',
    default: 'BAIK',
  })
  @Column({ type: 'varchar', length: 30, default: 'BAIK' })
  kondisi: KondisiKendaraan;

  @ApiProperty({
    description: 'Status operasional kendaraan.',
    enum: STATUS_KENDARAAN,
    example: 'TERSEDIA',
    default: 'TERSEDIA',
  })
  @Column({ type: 'varchar', length: 20, default: 'TERSEDIA' })
  status: StatusKendaraan;

  @ApiPropertyOptional({
    description: 'Nomor rangka kendaraan.',
    example: 'MHFXXXXX123456789',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  nomorRangka: string | null;

  @ApiPropertyOptional({
    description: 'Nomor mesin kendaraan.',
    example: '2GD1234567',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  nomorMesin: string | null;

  @ApiProperty({
    description: 'Odometer terakhir (km).',
    example: 45000,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  odometer: number;

  @ApiPropertyOptional({
    description: 'Tanggal jatuh tempo pajak (YYYY-MM-DD).',
    example: '2027-03-31',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  tanggalPajak: string | null;

  @ApiPropertyOptional({
    description: 'Catatan tambahan mengenai kendaraan.',
    example: 'Kendaraan operasional pimpinan.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  catatan: string | null;

  @ApiPropertyOptional({
    description: 'ID Perangkat Daerah pengelola kendaraan.',
    example: 1,
    nullable: true,
  })
  @Column({ name: 'pd_id', type: 'int', nullable: true })
  pdId: number | null;

  @ApiPropertyOptional({
    description: 'Perangkat Daerah pengelola kendaraan.',
    type: () => Pd,
    nullable: true,
  })
  @ManyToOne(() => Pd, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pd_id' })
  pd: Pd | null;

  @ApiPropertyOptional({
    description:
      'Data penugasan aktif terakhir (diisi pada endpoint detail kendaraan).',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  penugasanAktif?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description:
      'Riwayat kondisi terbaru (diisi pada endpoint detail kendaraan).',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  riwayatKondisiTerbaru?: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
