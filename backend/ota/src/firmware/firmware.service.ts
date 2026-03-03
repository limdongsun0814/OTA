import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Firmware } from './entities/firmware.entity';
import { Not, Repository } from 'typeorm';
import { FirmwareDto } from './dto/Firmware.dto';
import path from 'path';
import { MqttService } from 'src/mqtt/mqtt.service';
import { status } from 'src/mcu/entities/status.enum';
import { McuService } from 'src/mcu/mcu.service';

@Injectable()
export class FirmwareService {
  UPLOAD_DIR = path.join(process.cwd(), 'upload');
  constructor(
    @InjectRepository(Firmware)
    private readonly firmwareRepo: Repository<Firmware>,
    private readonly mcuService: McuService,
    private readonly mqttService: MqttService,
  ) {}

  async findAll(): Promise<Firmware[]> {
    return await this.firmwareRepo.find();
  }

  async firmwareUpdate(firmwareArrInput: { [key: string]: FirmwareDto }) {
    console.log(firmwareArrInput);
    const checkFirmware = new Map<
      string,
      { chipIds: string[]; fileSize: number }
    >();

    const socketData: { [key: string]: string } = {};
    for (const chip_id in firmwareArrInput) {
      if (firmwareArrInput[chip_id]['upload firmware'] == undefined) return;
      const check = await this.firmwareRepo.findOneBy({
        chip_id: chip_id,
        upload_firmware: Not(firmwareArrInput[chip_id]['upload firmware']),
      });
      console.log(check, 'check');
      if (check) {
        socketData[chip_id] = 'waiting';
        this.mcuService
          .update(chip_id, {
            status: status.waiting,
          })
          .then((data) =>
            console.log(data, data ? 'waiting success' : 'waiting failed'),
          )
          .catch((err) => console.log(err));

        if (!checkFirmware.has(firmwareArrInput[chip_id]['upload firmware']))
          checkFirmware.set(firmwareArrInput[chip_id]['upload firmware'], {
            chipIds: [],
            fileSize: check.upload_firmware.file_size,
          });

        checkFirmware
          .get(firmwareArrInput[chip_id]['upload firmware'])
          ?.chipIds.push(chip_id);

        this.firmwareRepo
          .update(chip_id, {
            upload_firmware: {
              file_name: firmwareArrInput[chip_id]['upload firmware'],
            },
          })
          .catch((err) => console.log(err));
      }
    }
    const chunkSize = 1000;

    console.log(checkFirmware, 'checkFirmware');

    for (const fileName of checkFirmware.keys()) {
      //소켓
      const status = {
        chunkCnt: Math.ceil(
          (checkFirmware.get(fileName)?.fileSize ?? 0) / chunkSize,
        ),
        chunkSize: chunkSize,
        fileSize: checkFirmware.get(fileName)?.fileSize ?? 0,
        fileName: this.UPLOAD_DIR + '/' + fileName,
        chipIds: checkFirmware.get(fileName)?.chipIds,
      };
      this.mqttService.emit('status', JSON.stringify(status));
    }
  }
}
