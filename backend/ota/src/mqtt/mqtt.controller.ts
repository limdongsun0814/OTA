import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MqttService } from './mqtt.service';
import { StatePayloadDto } from './dto/statusMqtt.dto';
import { StateService } from 'src/state/state.service';
import { StateDto } from 'src/state/dto/state.dto';
import { SocketService } from 'src/socket/socket.service';

@Controller()
export class MqttController {
  constructor(
    private readonly mqttService: MqttService,
    private readonly stateService: StateService,
    private readonly socketService: SocketService,
  ) {}

  @MessagePattern('status')
  setupState(@Payload() payload: StatePayloadDto) {
    this.mqttService.pubStatus(payload).catch((err) => {
      console.log(err);
    });
  }

  @MessagePattern('backend')
  FirmwareUpdate(@Payload() payload: StateDto) {
    this.mqttService.pubFirmware(payload).catch((err) => {
      console.log(err);
    });
  }
  @MessagePattern('test')
  test() {
    this.socketService.send('status', 'aaaa');

    // this.mqttService.test().catch((err) => {
    //   console.log(err);
    // });
  }
}
