import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Firmware {
  @PrimaryColumn()
  // @OneToMany(() => Firmware, (firmware) => firmware.upload_firmware)
  file_name: string;
  @Column()
  file_size: number;
  @UpdateDateColumn()
  @CreateDateColumn()
  upload_time: Date;
}
