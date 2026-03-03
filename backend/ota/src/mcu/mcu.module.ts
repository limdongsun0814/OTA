import { Module } from '@nestjs/common';
import { McuService } from './mcu.service';
import { McuController } from './mcu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mcu } from './entities/mcu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mcu])],
  controllers: [McuController],
  providers: [McuService],
  exports: [McuService],
})
export class McuModule {}
