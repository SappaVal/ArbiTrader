import { Entity, Column } from 'typeorm';
import { BaseTable } from './base/base.table';

@Entity()
export class TradingPair extends BaseTable {
  @Column({ unique: true })
  symbol: string;
}
