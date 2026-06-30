import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { status } from './status.enum';
import { Firmware } from 'src/firmware/entities/firmware.entity';

@Entity()
export class Mcu {
  @PrimaryColumn()
  chip_id: string;
  @Column()
  ip: string;
  @Column({
    type: 'enum',
    enum: status,
  })
  status: status;
  @UpdateDateColumn()
  last_upload_time: Date;
  @ManyToOne(() => Firmware, { eager: true })
  @JoinColumn({ name: 'upload_firmware', referencedColumnName: 'file_name' })
  upload_firmware: Firmware;
}
