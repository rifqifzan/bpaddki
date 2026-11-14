import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  KONDISI_KENDARAAN,
  type KondisiKendaraan,
} from '../../../common/constants/domain.constants.js';
import { Kendaraan } from '../../kendaraan/entities/kendaraan.entity.js';

@Entity('riwayat_kondisi')
@Index('idx_riwayat_kondisi_kendaraan_tanggal', ['kendaraanId', 'tanggal'])
export class RiwayatKondisi {
  @ApiProperty({ description: 'ID riwayat kondisi.', example: 1 })
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
    description: 'Kondisi kendaraan pada saat pencatatan.',
    enum: KONDISI_KENDARAAN,
    example: 'RUSAK_RINGAN',
  })
  @Column({ type: 'varchar', length: 30 })
  kondisi: KondisiKendaraan;

  @ApiProperty({
    description: 'Tanggal pencatatan kondisi (YYYY-MM-DD).',
    example: '2026-11-14',
  })
  @Column({ type: 'date' })
  tanggal: string;

  @ApiPropertyOptional({
    description: 'Keterangan kondisi/perubahan.',
    example: 'Lampu depan kanan mati.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  keterangan: string | null;

  @ApiPropertyOptional({
    description: 'Nama petugas yang mencatat.',
    example: 'Siti Aminah',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  dicatatOleh: string | null;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
