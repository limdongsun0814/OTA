import { Body, Controller, Post } from '@nestjs/common';
import { McuService } from './mcu.service';
import { UpdateMcuDto } from './dto/update-mcu.dto';
import { SocketService } from 'src/socket/socket.service';
import { status } from './entities/status.enum';

@Controller('mcu')
export class McuController {
  constructor(private readonly mcuService: McuService) {}

  @Post()
  async startMcu(@Body() updateMcuDto: UpdateMcuDto) {
    console.log(updateMcuDto);
    if (updateMcuDto.chip_id == undefined) return;
    updateMcuDto.status = status.start;
    await this.mcuService.update(updateMcuDto.chip_id, updateMcuDto);

    return { send: 'ok' };
  }
}
