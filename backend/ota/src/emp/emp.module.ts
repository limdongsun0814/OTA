import { Module } from '@nestjs/common';
import { EmpService } from './emp.service';
import { EmpController } from './emp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Emp } from './entities/emp.entity';
import { SocketModule } from 'src/socket/socket.module';

@Module({
  imports: [TypeOrmModule.forFeature([Emp]), SocketModule],
  controllers: [EmpController],
  providers: [EmpService],
})
export class EmpModule {}
