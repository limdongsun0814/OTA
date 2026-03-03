import { Module } from '@nestjs/common';
import { EmpService } from './emp.service';
import { EmpController } from './emp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Emp } from './entities/emp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Emp])],
  controllers: [EmpController],
  providers: [EmpService],
})
export class EmpModule {}
