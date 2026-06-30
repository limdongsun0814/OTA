import { forwardRef, Module } from '@nestjs/common';
import { McuService } from './mcu.service';
import { McuController } from './mcu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mcu } from './entities/mcu.entity';
import { SocketModule } from 'src/socket/socket.module';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { FirmwareModule } from 'src/firmware/firmware.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mcu]),
    SocketModule,
    forwardRef(() => MqttModule),
    FirmwareModule,
  ],
  controllers: [McuController],
  providers: [McuService],
  exports: [McuService],
})
export class McuModule {}
