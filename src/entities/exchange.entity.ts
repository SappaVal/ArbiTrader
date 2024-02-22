import { Column, Entity, OneToMany } from 'typeorm';
import { BaseTable } from './base/base.table';
import { TradingPair } from './trading-pair.entity';

@Entity()
export class Exchange extends BaseTable {
  @Column()
  name: string;

  @Column()
  apiUrl: string;

  @OneToMany(() => TradingPair, (tradingPair) => tradingPair.exchange)
  tradingPair: TradingPair[];
}
