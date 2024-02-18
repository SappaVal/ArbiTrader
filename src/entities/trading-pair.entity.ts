import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  OneToMany,
} from 'typeorm';
import { BaseTable } from './base/base.table';
import { Exchange } from './exchange.entity';
import { HistoricalPrice } from './historical-price.entity';

@Entity()
@Unique(['symbol', 'exchangeId'])
export class TradingPair extends BaseTable {
  @Column({ nullable: false })
  symbol: string;

  @OneToMany(
    () => HistoricalPrice,
    (historicalPrice) => historicalPrice.tradingPair,
  )
  historicalPrices: HistoricalPrice[];

  @ManyToOne(() => Exchange, (exchange) => exchange.tradingPair)
  @JoinColumn({ name: 'exchangeId' })
  exchange: Exchange;

  @Column({ nullable: false })
  exchangeId: number;
}
