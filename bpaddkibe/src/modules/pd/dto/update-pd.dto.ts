import { PartialType } from '@nestjs/swagger';
import { CreatePdDto } from './create-pd.dto.js';

export class UpdatePdDto extends PartialType(CreatePdDto) {}
