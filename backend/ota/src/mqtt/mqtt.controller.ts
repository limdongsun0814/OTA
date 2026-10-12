import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MqttService } from './mqtt.service';
import { StatePayloadDto } from './dto/statusMqtt.dto';
import { StateService } from 'src/state/state.service';
import { StateDto } from 'src/state/dto/state.dto';
import { SocketService } from 'src/socket/socket.service';
import { UpdateMcuDto } from 'src/mcu/dto/update-mcu.dto';
import { McuService } from 'src/mcu/mcu.service';

@Controller()
export class MqttController {
  constructor(
    private readonly mqttService: MqttService,
    private readonly stateService: StateService,
    private readonly socketService: SocketService,
    private readonly mcuService: McuService,
  ) {}
  @MessagePattern('state')
  async setupState(@Payload() payload: UpdateMcuDto) {
    console.log(payload);
    if (payload.chip_id === undefined) return;
    await this.mcuService.update(payload.chip_id, payload);
  }

  @MessagePattern('status')
  setupStatus(@Payload() payload: StatePayloadDto) {
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
  }
}
