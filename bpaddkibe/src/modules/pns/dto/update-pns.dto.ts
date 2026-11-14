import { PartialType } from '@nestjs/swagger';
import { CreatePnsDto } from './create-pns.dto.js';

export class UpdatePnsDto extends PartialType(CreatePnsDto) {}
