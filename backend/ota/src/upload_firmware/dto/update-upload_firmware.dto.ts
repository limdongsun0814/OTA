import { PartialType } from '@nestjs/mapped-types';
import { CreateUploadFirmwareDto } from './create-upload_firmware.dto';

export class UpdateUploadFirmwareDto extends PartialType(CreateUploadFirmwareDto) {}
