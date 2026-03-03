import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { FirmwareService } from './firmware.service';
import { FirmwareDto } from './dto/Firmware.dto';

@Controller('firmware')
export class FirmwareController {
  constructor(private readonly firmwareService: FirmwareService) {}

  @Get()
  async findAll() {
    return await this.firmwareService.findAll();
  }
  @Put()
  firmwareUpdate(@Body() firmwareArrInput: { [key: string]: FirmwareDto }) {
    this.firmwareService.firmwareUpdate(firmwareArrInput);
    return { 0: [] };
  }
}
