import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Emp } from './entities/emp.entity';
import { Repository } from 'typeorm';
import { CreateEmpDto } from './dto/create-emp.dto';
import crypto from 'crypto';

@Injectable()
export class EmpService {
  constructor(
    @InjectRepository(Emp)
    private readonly empRepo: Repository<Emp>,
  ) {}
  async loginCheck(createEmpDto: CreateEmpDto): Promise<number> {
    const pw = crypto
      .createHash('sha256')
      .update(createEmpDto.id)
      .update(createEmpDto.pw)
      .digest('hex');
    console.log(createEmpDto, pw);
    return this.empRepo.count({
      where: { emp_no: createEmpDto.id, password: pw },
    });
  }
}
