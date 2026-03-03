import { Controller, Post, Body } from '@nestjs/common';
import { EmpService } from './emp.service';
import { CreateEmpDto } from './dto/create-emp.dto';
import { SocketService } from 'src/socket/socket.service';

@Controller()
export class EmpController {
  constructor(
    private readonly empService: EmpService,
    private readonly socketService: SocketService,
  ) {}

  @Post('/login')
  async create(@Body() createEmpDto: CreateEmpDto) {
    if ((await this.empService.loginCheck(createEmpDto)) == 1) {
      return { search: true };
    }
    return { search: false };
  }

  @Post('test')
  test() {
    this.socketService.send('status', 'aaaa');

    // this.mqttService.test().catch((err) => {
    //   console.log(err);
    // });
  }
}
