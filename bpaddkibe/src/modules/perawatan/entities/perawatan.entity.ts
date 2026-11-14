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
  JENIS_PERAWATAN,
  STATUS_PERAWATAN,
  type JenisPerawatan,
  type StatusPerawatan,
} from '../../../common/constants/domain.constants.js';
import { decimalTransformer } from '../../../database/transformers.js';
import { Kendaraan } from '../../kendaraan/entities/kendaraan.entity.js';

@Entity('perawatan')
@Index('idx_perawatan_kendaraan_tanggal', ['kendaraanId', 'tanggal'])
@Index('idx_perawatan_status', ['status'])
export class Perawatan {
  @ApiProperty({ description: 'ID perawatan.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID kendaraan.', example: 1 })
  @Column({ name: 'kendaraan_id', type: 'int' })
  kendaraanId: number;

  @ApiProperty({ description: 'Kendaraan terkait.', type: () => Kendaraan })
  @ManyToOne(() => Kendaraan, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kendaraan_id' })
  kendaraan: Kendaraan;

  @ApiProperty({
    description: 'Jenis perawatan.',
    enum: JENIS_PERAWATAN,
    example: 'SERVIS_RUTIN',
  })
  @Column({ type: 'varchar', length: 30 })
  jenis: JenisPerawatan;

  @ApiProperty({
    description: 'Tanggal pelaksanaan/rencana perawatan (YYYY-MM-DD).',
    example: '2026-11-14',
  })
  @Column({ type: 'date' })
  tanggal: string;

  @ApiProperty({
    description: 'Deskripsi pekerjaan perawatan.',
    example: 'Servis rutin 10.000 km, ganti oli dan filter.',
  })
  @Column({ type: 'text' })
  deskripsi: string;

  @ApiPropertyOptional({
    description: 'Nama bengkel/penyedia jasa.',
    example: 'Auto2000 Cibinong',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 150, nullable: true })
  bengkel: string | null;

  @ApiProperty({
    description: 'Biaya perawatan (Rupiah).',
    example: 1250000,
    default: 0,
  })
  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  biaya: number;

  @ApiPropertyOptional({
    description: 'Odometer kendaraan saat perawatan (km).',
    example: 45500,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  odometer: number | null;

  @ApiProperty({
    description: 'Status perawatan.',
    enum: STATUS_PERAWATAN,
    example: 'SELESAI',
    default: 'SELESAI',
  })
  @Column({ type: 'varchar', length: 20, default: 'SELESAI' })
  status: StatusPerawatan;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
