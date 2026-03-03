import { Type } from 'class-transformer';
import { McuDto } from 'src/mcu/dto/mcu.dto';
import { UploadFirmwareDto } from 'src/upload_firmware/dto/uploadFirmware.dto';

export class FirmwareDto {
  @Type(() => McuDto)
  chip_id: McuDto;

  last_upload_time: string;

  @Type(() => UploadFirmwareDto)
  upload_firmware: UploadFirmwareDto;

  'upload firmware': string;
  status: string;
}
