import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { TradingPair } from './trading-pair.entity';

@Index(['tradingPairId', 'interval', 'openTime', 'closeTime'], { unique: true })
@Entity()
export class HistoricalPrice {
  @PrimaryColumn({ type: 'bigint' })
  openTime: number;

  @Column('decimal', { precision: 22, scale: 8 })
  open: string;

  @Column('decimal', { precision: 22, scale: 8 })
  high: string;

  @Column('decimal', { precision: 22, scale: 8 })
  low: string;

  @Column('decimal', { precision: 22, scale: 8 })
  close: string;

  @Column('decimal', { precision: 30, scale: 8 })
  volume: string;

  @PrimaryColumn({ type: 'bigint' })
  closeTime: number;

  @PrimaryColumn({ nullable: false })
  interval: string;

  @ManyToOne(() => TradingPair, (tradingPair) => tradingPair.historicalPrices)
  @JoinColumn({ name: 'tradingPairId' })
  tradingPair: TradingPair;

  @PrimaryColumn({ nullable: false })
  tradingPairId: number;
}
