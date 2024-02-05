import { Entity, ManyToOne } from 'typeorm';
import { BaseTable } from './base/base.table';
import { User } from './user.entity';
import { GlobalParam } from './global-param.entity';

@Entity()
export class UserGlobalParam extends BaseTable {
  @ManyToOne(() => User, (user) => user.globalParams)
  user: User;

  @ManyToOne(() => GlobalParam, (globalParam) => globalParam.userGlobalParams)
  globalParam: GlobalParam;

  value: string;
}
