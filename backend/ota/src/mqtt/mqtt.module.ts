import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileModule } from 'src/file/file.module';
import { CryptoModule } from 'src/crypto/crypto.module';
import { StateModule } from 'src/state/state.module';
import { SocketModule } from 'src/socket/socket.module';
import { McuModule } from 'src/mcu/mcu.module';

@Module({
  imports: [
    FileModule,
    CryptoModule,
    StateModule,
    McuModule,
    SocketModule,
    ClientsModule.registerAsync([
      {
        name: 'MQTT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.MQTT,
          options: {
            url: configService.get<string>('MQTT_BROKER'),
          },
        }),
      },
    ]),
  ],
  controllers: [MqttController],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
