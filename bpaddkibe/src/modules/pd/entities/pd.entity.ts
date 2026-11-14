import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pd')
export class Pd {
  @ApiProperty({ description: 'ID Perangkat Daerah.', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Kode unik Perangkat Daerah.',
    example: 'DISDIK',
    maxLength: 20,
  })
  @Column({ type: 'varchar', length: 20, unique: true })
  kode: string;

  @ApiProperty({
    description: 'Nama lengkap Perangkat Daerah.',
    example: 'Dinas Pendidikan',
    maxLength: 150,
  })
  @Column({ type: 'varchar', length: 150 })
  nama: string;

  @ApiPropertyOptional({
    description: 'Singkatan/nama pendek Perangkat Daerah.',
    example: 'DPendidikan',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: true })
  singkatan: string | null;

  @ApiPropertyOptional({
    description: 'Alamat kantor.',
    example: 'Jl. Pendidikan No. 1',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  alamat: string | null;

  @ApiPropertyOptional({
    description: 'Nomor telepon kantor.',
    example: '021-1234567',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 30, nullable: true })
  telepon: string | null;

  @ApiProperty({
    description: 'Status aktif Perangkat Daerah.',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  aktif: boolean;

  @ApiPropertyOptional({
    description:
      'Jumlah PNS yang terdaftar pada PD ini (dihitung saat dibaca).',
    example: 12,
  })
  jumlahPns?: number;

  @ApiPropertyOptional({
    description:
      'Jumlah kendaraan yang dikelola PD ini (dihitung saat dibaca).',
    example: 5,
  })
  jumlahKendaraan?: number;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2026-11-14T10:15:30.000Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
