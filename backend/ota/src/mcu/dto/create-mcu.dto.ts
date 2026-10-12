import { Firmware } from 'src/firmware/entities/firmware.entity';
import { status } from '../entities/status.enum';

export class CreateMcuDto {
  chip_id: string;
  ip: string;
  status: status;
  detail: string;
  last_upload_time: Date;
  upload_firmware: Firmware;
}
