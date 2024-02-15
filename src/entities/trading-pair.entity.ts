import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseTable } from './base/base.table';
import { Exchange } from './exchange.entity';

@Entity()
@Unique(['symbol', 'exchangeId'])
export class TradingPair extends BaseTable {
  @Column({ unique: true })
  symbol: string;

  @ManyToOne(() => Exchange, (exchange) => exchange.tradingPair)
  @JoinColumn({ name: 'exchangeId' })
  exchange: Exchange;

  @Column({ nullable: false })
  exchangeId: number;
}
