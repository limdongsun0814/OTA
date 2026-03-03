import { Module } from '@nestjs/common';
import { UploadFirmwareService } from './upload_firmware.service';
import { UploadFirmwareController } from './upload_firmware.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFirmware } from './entities/upload_firmware.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UploadFirmware])],
  controllers: [UploadFirmwareController],
  providers: [UploadFirmwareService],
})
export class UploadFirmwareModule {}
