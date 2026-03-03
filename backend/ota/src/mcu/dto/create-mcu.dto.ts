import { status } from '../entities/status.enum';

export class CreateMcuDto {
  chip_id: string;
  ip: string;
  status: status;
}
