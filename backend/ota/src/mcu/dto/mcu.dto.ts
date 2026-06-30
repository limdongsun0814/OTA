import { status } from '../entities/status.enum';
import { Firmware } from 'src/firmware/entities/firmware.entity';

export class McuDto {
  chip_id: string;

  ip: string;

  status: status;
  last_upload_time: Date;
  upload_firmware: Firmware;
}
