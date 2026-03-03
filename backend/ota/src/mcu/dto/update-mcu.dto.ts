import { PartialType } from '@nestjs/mapped-types';
import { CreateMcuDto } from './create-mcu.dto';

export class UpdateMcuDto extends PartialType(CreateMcuDto) {}
