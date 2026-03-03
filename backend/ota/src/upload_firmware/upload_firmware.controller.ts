import { Controller, Get } from '@nestjs/common';
import { UploadFirmwareService } from './upload_firmware.service';

@Controller('')
export class UploadFirmwareController {
  constructor(private readonly uploadFirmwareService: UploadFirmwareService) {}

  @Get('/upload/firmware')
  async findAll() {
    return await this.uploadFirmwareService.findAll();
  }
}
