import { Injectable } from '@nestjs/common';
import { CreateMcuDto } from './dto/create-mcu.dto';
import { UpdateMcuDto } from './dto/update-mcu.dto';
import { Mcu } from './entities/mcu.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class McuService {
  constructor(
    @InjectRepository(Mcu)
    private readonly meuRepo: Repository<Mcu>,
  ) {}

  async update(id: string, updateMcuDto: UpdateMcuDto) {
    await this.meuRepo.update(id, updateMcuDto);
    return await this.meuRepo.countBy(updateMcuDto);
  }
}
