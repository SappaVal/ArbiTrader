import { Entity, Column, OneToMany } from 'typeorm';
import { BaseTable } from './base/base.table';
import { UserGlobalParam } from './user-global-param.entity';

@Entity()
export class GlobalParam extends BaseTable {
  @Column()
  label: string;

  @OneToMany(
    () => UserGlobalParam,
    (userGlobalParam) => userGlobalParam.globalParam,
  )
  userGlobalParams: UserGlobalParam[];
}
