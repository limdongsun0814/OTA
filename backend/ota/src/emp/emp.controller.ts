import { Controller, Post, Body } from '@nestjs/common';
import { EmpService } from './emp.service';
import { CreateEmpDto } from './dto/create-emp.dto';

@Controller()
export class EmpController {
  constructor(private readonly empService: EmpService) {}

  @Post('/login')
  async create(@Body() createEmpDto: CreateEmpDto) {
    if ((await this.empService.loginCheck(createEmpDto)) == 1) {
      return { search: true };
    }
    return { search: false };
  }
}
