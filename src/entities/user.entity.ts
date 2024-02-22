import { UserRole } from 'src/entities/enum/user-role.enum';
import { Column, CreateDateColumn, Entity } from 'typeorm';
import { BaseTable } from './base/base.table';

@Entity()
export class User extends BaseTable {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  role: UserRole;

  @Column()
  @CreateDateColumn()
  lastLoginDate: Date;
}
