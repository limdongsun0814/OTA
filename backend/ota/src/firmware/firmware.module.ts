import { Module } from '@nestjs/common';
import { FirmwareService } from './firmware.service';
import { FirmwareController } from './firmware.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Firmware } from './entities/firmware.entity';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { SocketModule } from 'src/socket/socket.module';
import { McuModule } from 'src/mcu/mcu.module';

@Module({
  imports: [TypeOrmModule.forFeature([Firmware]), McuModule, MqttModule],
  controllers: [FirmwareController],
  providers: [FirmwareService],
})
export class FirmwareModule {}
