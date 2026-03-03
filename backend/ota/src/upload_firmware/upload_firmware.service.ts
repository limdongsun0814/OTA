import { Injectable } from '@nestjs/common';
import { CreateUploadFirmwareDto } from './dto/create-upload_firmware.dto';
import { UpdateUploadFirmwareDto } from './dto/update-upload_firmware.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadFirmware } from './entities/upload_firmware.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UploadFirmwareService {
  constructor(
    @InjectRepository(UploadFirmware)
    private readonly UploadFirmwareRepo: Repository<UploadFirmware>,
  ) {}
  async findAll() {
    return this.UploadFirmwareRepo.find();
  }
}
