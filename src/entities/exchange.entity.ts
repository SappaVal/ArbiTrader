import { Entity, Column, OneToMany } from 'typeorm';
import { BaseTable } from './base/base.table';
import { UserExchange } from './user-exchange.entity.ts';
import { Wallet } from './wallet.entity';
import { TradingPair } from './trading-pair.entity';

@Entity()
export class Exchange extends BaseTable {
  @Column()
  name: string;

  @Column()
  apiUrl: string;

  @OneToMany(() => UserExchange, (userExchange) => userExchange.exchange)
  users: UserExchange[];

  @OneToMany(() => Wallet, (wallet) => wallet.exchange)
  wallets: Wallet[];

  @OneToMany(() => TradingPair, (tradingPair) => tradingPair.exchange)
  tradingPair: TradingPair[];
}
