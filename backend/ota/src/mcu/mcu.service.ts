import { Injectable } from '@nestjs/common';
import { CreateMcuDto } from './dto/create-mcu.dto';
import { UpdateMcuDto } from './dto/update-mcu.dto';
import { Mcu } from './entities/mcu.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class McuService {
  constructor(
    @InjectRepository(Mcu)
    private readonly meuRepo: Repository<Mcu>,
    private readonly socketService: SocketService,
  ) {}

  async update(id: string, updateMcuDto: UpdateMcuDto) {
    console.log(id, updateMcuDto, updateMcuDto.status);
    await this.meuRepo.update(id, updateMcuDto).then(() => {
      console.log(
        '===========',
        { [id]: updateMcuDto.status },
        updateMcuDto.status,
      );
      this.socketService.send('status', { [id]: updateMcuDto.status });
      if (updateMcuDto.ip == undefined) return;
      this.socketService.send('ip', { [id]: updateMcuDto.ip });
    });
    return await this.meuRepo.countBy(updateMcuDto);
  }
}
