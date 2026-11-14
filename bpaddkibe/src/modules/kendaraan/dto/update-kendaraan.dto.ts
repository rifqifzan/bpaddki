import { PartialType } from '@nestjs/swagger';
import { CreateKendaraanDto } from './create-kendaraan.dto.js';

export class UpdateKendaraanDto extends PartialType(CreateKendaraanDto) {}
