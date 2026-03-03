import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { status } from './status.enum';
import { Firmware } from 'src/firmware/entities/firmware.entity';

@Entity()
export class Mcu {
  @PrimaryColumn()
  @OneToMany(() => Firmware, (firmware) => firmware.chip_id)
  chip_id: string;
  @Column()
  ip: string;
  @Column({
    type: 'enum',
    enum: status,
  })
  status: status;
}
