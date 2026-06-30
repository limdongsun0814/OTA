import {
  Controller,
  Get,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { FirmwareService } from './firmware.service';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('firmware')
export class FirmwareController {
  constructor(private readonly firmwareService: FirmwareService) {}

  @Get()
  async findAll() {
    return await this.firmwareService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('upload'))
  async firmwareUpload(@UploadedFile() file: Express.Multer.File) {
    const result = await this.firmwareService.firmwareUpload(file);
    return result;
  }
  @Get('/unused')
  async firmwareUnused() {
    const result = this.firmwareService.unused();
    return result;
  }
  @Delete('/unused')
  async removeFirmware(@Body() removeFirmware: Record<string, boolean>) {
    console.log(removeFirmware, Object.keys(removeFirmware));
    const result = await this.firmwareService.removeFirmware(
      Object.keys(removeFirmware),
    );
    return result;
  }
}
