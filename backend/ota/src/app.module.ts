import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FirmwareModule } from './firmware/firmware.module';
import { EmpModule } from './emp/emp.module';
import { McuModule } from './mcu/mcu.module';
import { UploadFirmwareModule } from './upload_firmware/upload_firmware.module';
import * as Joi from 'joi';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MqttModule } from './mqtt/mqtt.module';
import { CryptoModule } from './crypto/crypto.module';
import { FileModule } from './file/file.module';
import { StateModule } from './state/state.module';
import { SocketGateway } from './socket/socket.gateway';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB: Joi.string().required(),
        MQTT_BROKER: Joi.string().required(),
        SECRET_AES_KEY: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<number>('DB_PORT')),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB'),
        autoLoadEntities: true,
      }),
    }),
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
    FirmwareModule,
    EmpModule,
    McuModule,
    UploadFirmwareModule,
    MqttModule,
    CryptoModule,
    FileModule,
    StateModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SocketGateway,
    {
      provide: 'KEY',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        Buffer.from(configService.get<string>('SECRET_AES_KEY') ?? '', 'hex'),
    },
  ],
  exports: [ClientsModule],
})
export class AppModule {}
