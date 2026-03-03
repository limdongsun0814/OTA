import { Mcu } from 'src/mcu/entities/mcu.entity';
import { UploadFirmware } from 'src/upload_firmware/entities/upload_firmware.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Firmware {
  @PrimaryColumn()
  @ManyToOne(() => Mcu, (mcu) => mcu.chip_id, { eager: true })
  @JoinColumn({ name: 'chip_id' })
  chip_id: string;
  @CreateDateColumn()
  last_upload_time: Date;
  @ManyToOne(() => UploadFirmware, { eager: true })
  @JoinColumn({ name: 'upload_firmware', referencedColumnName: 'file_name' })
  upload_firmware: UploadFirmware;
}
