import { Injectable } from '@nestjs/common';
import { UpdateMcuDto } from './dto/update-mcu.dto';
import { Mcu } from './entities/mcu.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketService } from 'src/socket/socket.service';
import path from 'path';
import { MqttService } from 'src/mqtt/mqtt.service';
import { status } from './entities/status.enum';
import { FirmwareService } from 'src/firmware/firmware.service';

@Injectable()
export class McuService {
  UPLOAD_DIR = path.join(process.cwd(), 'upload');
  chunkSize = 1000;

  constructor(
    @InjectRepository(Mcu)
    private readonly mcuRepo: Repository<Mcu>,
    private readonly socketService: SocketService,
    private readonly mqttService: MqttService,
    private readonly firmwareService: FirmwareService,
  ) {}

  async findAll(): Promise<Mcu[]> {
    return await this.mcuRepo.find();
  }
  //요기 로직 정리가 필요하다
  async update(id: string, updateMcuDto: UpdateMcuDto) {
    console.log(id, updateMcuDto, updateMcuDto.status);
    await this.mcuRepo.update(id, updateMcuDto).then(() => {
      if (updateMcuDto.status == undefined) return;
      console.log(
        '===========',
        { [id]: updateMcuDto.status },
        updateMcuDto.status,
      );
      this.socketService.send('status', { [id]: updateMcuDto.status });
      if (updateMcuDto.ip == undefined) return;
      this.socketService.send('ip', { [id]: updateMcuDto.ip });
    });
    return await this.mcuRepo.countBy(updateMcuDto);
  }
  async updateMcu(firmwareArrInput: { [key: string]: Mcu }) {
    console.log(firmwareArrInput);
    const checkFirmware = new Map<
      string,
      { chipIds: string[]; fileSize: number }
    >();

    const socketData: { [key: string]: string } = {};
    for (const chip_id in firmwareArrInput) {
      if (firmwareArrInput[chip_id]['upload firmware'] == undefined) return;
      const check = await this.mcuRepo.findOneBy({
        chip_id: chip_id,
        upload_firmware: Not(firmwareArrInput[chip_id]['upload firmware']),
      });
      const firmwareList = new Map<string, number>();
      await this.firmwareService.findAll().then((data) =>
        data.forEach((firmware) => {
          firmwareList.set(firmware.file_name, firmware.file_size);
        }),
      );
      console.log(check, 'check');
      if (check) {
        socketData[chip_id] = 'waiting';
        this.update(chip_id, {
          status: status.waiting,
        })
          .then((data) =>
            console.log(data, data ? 'waiting success' : 'waiting failed'),
          )
          .catch((err) => console.log(err));

        if (!checkFirmware.has(firmwareArrInput[chip_id]['upload firmware'])) {
          checkFirmware.set(firmwareArrInput[chip_id]['upload firmware'], {
            chipIds: [],
            // fileSize: firmwareArrInput[chip_id].upload_firmware.file_size,
            // check.upload_firmware.file_size
            fileSize: firmwareList.get(
              firmwareArrInput[chip_id]['upload firmware'],
            )!,
          });
        }

        checkFirmware
          .get(firmwareArrInput[chip_id]['upload firmware'])
          ?.chipIds.push(chip_id);

        this.update(chip_id, {
          upload_firmware: {
            file_name: firmwareArrInput[chip_id]['upload firmware'],
          } as any,
        })
          .then(() => {
            this.firmwareService.findAll(true);
          })
          .catch((err) => console.log(err));
      }
    }

    console.log(checkFirmware, firmwareArrInput, 'checkFirmware');

    for (const fileName of checkFirmware.keys()) {
      //소켓
      const status = {
        chunkCnt: Math.ceil(
          (checkFirmware.get(fileName)?.fileSize ?? 0) / this.chunkSize,
        ),
        chunkSize: this.chunkSize,
        fileSize: checkFirmware.get(fileName)?.fileSize ?? 0,
        fileName: this.UPLOAD_DIR + '/' + fileName,
        chipIds: checkFirmware.get(fileName)?.chipIds,
      };
      this.mqttService.emit('status', JSON.stringify(status));
    }
  }
}
