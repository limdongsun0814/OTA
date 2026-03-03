import { Firmware } from 'src/firmware/entities/firmware.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UploadFirmware {
  @PrimaryColumn()
  @OneToMany(() => Firmware, (firmware) => firmware.upload_firmware)
  file_name: string;
  @Column()
  file_size: number;
  @UpdateDateColumn()
  @CreateDateColumn()
  upload_time: Date;
}
