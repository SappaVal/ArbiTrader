import { Entity, ManyToOne } from 'typeorm';
import { BaseTable } from './base/base.table';
import { User } from './user.entity';
import { Exchange } from './exchange.entity';

@Entity()
export class UserExchange extends BaseTable {
  @ManyToOne(() => User, (user) => user.exchanges)
  user: User;

  @ManyToOne(() => Exchange, (exchange) => exchange.users)
  exchange: Exchange;
}
