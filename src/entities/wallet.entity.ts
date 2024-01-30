import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseTable } from './base/base.table';
import { Exchange } from './exchange.entity';

@Entity()
export class Wallet extends BaseTable {
  @Column()
  currency: string;

  @Column()
  balance: number;

  @ManyToOne(() => Exchange, (exchange) => exchange.wallets)
  exchange: Exchange;
}
