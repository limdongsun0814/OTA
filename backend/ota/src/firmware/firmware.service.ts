import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Firmware } from './entities/firmware.entity';
import { In, Repository } from 'typeorm';
import path from 'path';
import { MqttService } from 'src/mqtt/mqtt.service';
import { McuService } from 'src/mcu/mcu.service';
import fs from 'fs/promises';
import { SocketService } from 'src/socket/socket.service';
import { string } from 'joi';

@Injectable()
export class FirmwareService {
  UPLOAD_DIR = path.join(process.cwd(), 'upload');
  constructor(
    @InjectRepository(Firmware)
    private readonly firmwareRepo: Repository<Firmware>,
    private readonly socketService: SocketService,
  ) {}

  async removeFirmware(
    firmwareList: string[],
  ): Promise<{ deletedCount: number }> {
    const rmFile: string[] = [];

    await Promise.all(
      firmwareList.map(async (name) => {
        try {
          await fs.unlink(`${this.UPLOAD_DIR}/${name}`);
          await this.firmwareRepo.delete({ file_name: name });
          this.findAll(true);
          rmFile.push(name);
        } catch (err) {
          console.log(err);
        }
      }),
    );

    console.log(rmFile);
    return { deletedCount: rmFile.length };
  }

  async unused(): Promise<Firmware[]> {
    return this.firmwareRepo.query(
      `select * from firmware 
        where not exists 
          (select 1 from mcu 
          where mcu.upload_firmware = firmware.file_name)`,
    );
  }

  async findAll(socket?: any) {
    if (socket)
      this.unused()
        .then((data) => {
          this.socketService.send('FirmwareUnused', data);
        })
        .catch((err) => console.log(err));
    return this.firmwareRepo.find().then((data) => {
      if (socket) {
        this.socketService.send('FirmwareList', data);
      }
      return data;
    });
  }

  async save(data: string, size: number) {
    return this.firmwareRepo.save({ file_name: data, file_size: size });
  }

  async firmwareUpload(file: Express.Multer.File) {
    console.log(file);
    let msg = 'Error';
    let status = 500;
    let uploadFirmware;
    if (file) {
      const extension = file.originalname.split('.').slice(-2);
      const now = new Date();

      const formatted =
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0') +
        ' ' +
        String(now.getHours()).padStart(2, '0') +
        '-' +
        String(now.getMinutes()).padStart(2, '0') +
        '-' +
        String(now.getSeconds()).padStart(2, '0');

      console.log(formatted);
      console.log('Request:', file.originalname, file.size, extension);
      if (extension[1] == 'bin') {
        const buffer = Buffer.from(await file.buffer);
        await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
        const filePath = path.join(
          this.UPLOAD_DIR,
          formatted + file.originalname,
        );
        console.log(filePath);

        await this.save(formatted + file.originalname, Number(file.size));
        console.log(buffer[buffer.length - 1], 'result2');
        await fs.writeFile(filePath, buffer);
        uploadFirmware = await this.findAll(true);
        msg = 'success';
        status = 200;
      }
    }
    return { msg, status, uploadFirmware };
  }
}
