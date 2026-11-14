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
  PERAN_PENUGASAN,
  STATUS_PENUGASAN,
  type PeranPenugasan,
  type StatusPenugasan,
} from '../../../common/constants/domain.constants.js';
import { Kendaraan } from '../../kendaraan/entities/kendaraan.entity.js';
import { Pns } from '../../pns/entities/pns.entity.js';

@Entity('penugasan_kendaraan')
@Index('idx_penugasan_kendaraan_status', ['kendaraanId', 'status'])
@Index('idx_penugasan_pns_status', ['pnsId', 'status'])
export class PenugasanKendaraan {
  @ApiProperty({ description: 'ID penugasan.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'ID kendaraan.', example: 1 })
  @Column({ name: 'kendaraan_id', type: 'int' })
  kendaraanId: number;

  @ApiProperty({
    description: 'Kendaraan yang ditugaskan.',
    type: () => Kendaraan,
  })
  @ManyToOne(() => Kendaraan, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'kendaraan_id' })
  kendaraan: Kendaraan;

  @ApiProperty({
    description: 'ID PNS penanggung jawab/pengemudi.',
    example: 1,
  })
  @Column({ name: 'pns_id', type: 'int' })
  pnsId: number;

  @ApiProperty({
    description: 'PNS penanggung jawab/pengemudi.',
    type: () => Pns,
  })
  @ManyToOne(() => Pns, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pns_id' })
  pns: Pns;

  @ApiProperty({
    description: 'Peran PNS dalam penugasan.',
    enum: PERAN_PENUGASAN,
    example: 'PENANGGUNG_JAWAB',
    default: 'PENANGGUNG_JAWAB',
  })
  @Column({ type: 'varchar', length: 30, default: 'PENANGGUNG_JAWAB' })
  peran: PeranPenugasan;

  @ApiProperty({
    description: 'Tanggal mulai penugasan (YYYY-MM-DD).',
    example: '2026-01-01',
  })
  @Column({ type: 'date' })
  tanggalMulai: string;

  @ApiPropertyOptional({
    description: 'Tanggal selesai penugasan (YYYY-MM-DD).',
    example: '2026-12-31',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  tanggalSelesai: string | null;

  @ApiProperty({
    description: 'Status penugasan.',
    enum: STATUS_PENUGASAN,
    example: 'AKTIF',
    default: 'AKTIF',
  })
  @Column({ type: 'varchar', length: 20, default: 'AKTIF' })
  status: StatusPenugasan;

  @ApiPropertyOptional({
    description: 'Catatan penugasan.',
    example: 'Penanggung jawab harian kendaraan operasional.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  catatan: string | null;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
