import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { auth } from './auth.enum';

@Entity()
export class Emp {
  @PrimaryColumn()
  emp_no: string;
  @Column()
  name: string;
  @CreateDateColumn()
  hiredate: Date;
  @Column({
    type: 'enum',
    enum: auth,
  })
  auth: auth;
  @Column()
  password: string;
}
