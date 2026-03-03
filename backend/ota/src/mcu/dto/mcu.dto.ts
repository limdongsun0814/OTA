import { status } from '../entities/status.enum';

export class McuDto {
  chip_id: string;

  ip: string;

  status: status;
}
