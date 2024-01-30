import { Entity, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { BaseTable } from './base/base.table';
import { UserExchange } from './user-exchange.entity.ts';
import { UserGlobalParam } from './user-global-param.entity';
import { UserRole } from 'src/entities/enum/user-role.enum';

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

  @OneToMany(() => UserExchange, (userExchange) => userExchange.user)
  exchanges: UserExchange[];

  @OneToMany(() => UserGlobalParam, (userGlobalParam) => userGlobalParam.user)
  globalParams: UserGlobalParam[];
}
