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
import { Pd } from '../../pd/entities/pd.entity.js';

@Entity('pns')
@Index('idx_pns_pd', ['pdId'])
@Index('idx_pns_nama', ['nama'])
export class Pns {
  @ApiProperty({ description: 'ID PNS.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nama lengkap PNS.',
    example: 'Budi Santoso',
    maxLength: 150,
  })
  @Column({ type: 'varchar', length: 150 })
  nama: string;

  @ApiProperty({
    description: 'NIP (18 digit).',
    example: '197812312005011001',
  })
  @Column({ type: 'varchar', length: 18, unique: true })
  nip: string;

  @ApiProperty({
    description: 'Jabatan PNS.',
    example: 'Kepala Sub Bagian Umum',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  jabatan: string;

  @ApiProperty({
    description: 'Golongan PNS.',
    example: 'III/c',
    enum: [
      'I/a',
      'I/b',
      'I/c',
      'I/d',
      'II/a',
      'II/b',
      'II/c',
      'II/d',
      'III/a',
      'III/b',
      'III/c',
      'III/d',
      'IV/a',
      'IV/b',
      'IV/c',
      'IV/d',
      'IV/e',
    ],
  })
  @Column({ type: 'varchar', length: 10 })
  golongan: string;

  @ApiPropertyOptional({
    description: 'Email PNS.',
    example: 'budi.santoso@example.go.id',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 150, nullable: true, unique: true })
  email: string | null;

  @ApiPropertyOptional({
    description: 'Nomor telepon/HP.',
    example: '081234567890',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 30, nullable: true })
  telepon: string | null;

  @ApiProperty({
    description: 'Status aktif PNS.',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  aktif: boolean;

  @ApiProperty({
    description: 'ID Perangkat Daerah tempat PNS bertugas.',
    example: 1,
  })
  @Column({ name: 'pd_id', type: 'int' })
  pdId: number;

  @ApiProperty({
    description: 'Perangkat Daerah tempat PNS bertugas.',
    type: () => Pd,
  })
  @ManyToOne(() => Pd, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'pd_id' })
  pd: Pd;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
