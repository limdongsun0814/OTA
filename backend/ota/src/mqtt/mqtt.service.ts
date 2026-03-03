import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileService } from 'src/file/file.service';
import { StateDto } from 'src/state/dto/state.dto';
import { StatePayloadDto } from './dto/statusMqtt.dto';
import { StateService } from 'src/state/state.service';
import { CryptoService } from 'src/crypto/crypto.service';
import { SocketService } from 'src/socket/socket.service';
import { McuService } from 'src/mcu/mcu.service';
import { status } from 'src/mcu/entities/status.enum';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttService {
  private client = mqtt.connect(process.env.MQTT_BROKER ?? '');
  constructor(
    // @Inject('MQTT_SERVICE') private client: ClientProxy,
    private readonly fileService: FileService,
    private readonly stateService: StateService,
    private readonly cryptoService: CryptoService,
    private readonly socketService: SocketService,
    private readonly mcuService: McuService,
  ) {}
  emit(topic: string, payload: string | Buffer) {
    console.log('send mqtt', topic, payload);
    this.client.publish(topic, payload);
  }

  async pubStatus(payload: StatePayloadDto) {
    const state: StateDto = {
      chipId: '',
      filePath: payload.fileName,
      fileSize: payload.fileSize,
      chunkSize: payload.chunkSize,
      chunkMax: payload.chunkCnt,
      chunkIndex: 0,
    };

    for (const chipId of payload.chipIds) {
      state.chipId = chipId;

      const status = StateService.create(state);
      if (status == undefined) return;

      const file = await FileService.get(state.filePath);
      if (file == undefined) return;

      file.refCnt++;
      const buf = Buffer.alloc(4);
      buf.writeUInt32BE(state.fileSize);
      const transfer = Buffer.concat([Buffer.from(file.hash, 'hex'), buf]);
      this.client.publish(state.chipId + 'status', transfer);
    }
  }

  async pubFirmware(stateInput: StateDto) {
    const state = StateService.get(stateInput.chipId);
    if (state == undefined) return;
    state.chunkIndex = stateInput.chunkIndex;
    if (state.chunkIndex == 0) {
      this.mcuService
        .update(state.chipId, {
          status: status.uploading,
          chip_id: state.chipId,
        })
        .then((data) =>
          console.log(data, data ? 'update success' : 'update failed'),
        )
        .catch((err) => console.log(err));
      this.socketService.send('status', { [state.chipId]: 'uploading' });
    }
    const file = await FileService.get(state.filePath);
    if (file == undefined) return;
    const buf = FileService.slice(
      file.buffer,
      state.chunkIndex,
      state.chunkSize,
    );
    const { iv, encryptedArr } = this.cryptoService.crypto(buf);
    const transfer = Buffer.concat([iv, encryptedArr]);
    console.log(
      transfer.length,
      encryptedArr.length,
      buf.length,
      file.buffer.length,
      state.chunkIndex,
      state.chunkMax,
    );
    this.client.publish(state.chipId, transfer, () => {
      if (state.chunkIndex != state.chunkMax) return;

      this.mcuService
        .update(state.chipId, {
          status: status.restart,
          chip_id: state.chipId,
        })
        .then((data) =>
          console.log(data, data ? 'update success' : 'update failed'),
        )
        .catch((err) => console.log(err));
      this.socketService.send('status', { [state.chipId]: 'restart' });

      FileService.release(state.filePath);
      StateService.remove(state.chipId);
    });
  }
}
