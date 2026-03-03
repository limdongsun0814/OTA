import { Module } from '@nestjs/common';
import { McuService } from './mcu.service';
import { McuController } from './mcu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mcu } from './entities/mcu.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Mcu]), SocketModule],
  controllers: [McuController],
  providers: [McuService],
  exports: [McuService],
})
export class McuModule {}
