import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    CryptoService,
    {
      provide: 'KEY',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        Buffer.from(configService.get<string>('SECRET_AES_KEY') ?? '', 'hex'),
    },
  ],
  exports: [CryptoService],
})
export class CryptoModule {}
