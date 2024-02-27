import { IsBoolean, IsNumber, IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseTable } from './base/base.table';

import { TokenBlockchain } from './token-blockchain.entity';

@Entity()
@Index('unique_name_symbol_slug', ['name', 'symbol', 'slug'], { unique: true })
export class TokenInfos extends BaseTable {
  @Column()
  @IsString()
  name: string;

  @Column()
  @IsString()
  symbol: string;

  @Column()
  @IsString()
  slug: string;

  @Column('decimal', { nullable: true, precision: 22, scale: 8 })
  maxSupply: string;

  @Column('decimal', { nullable: true, precision: 22, scale: 8 })
  circulatingSupply: string;

  @Column('decimal', { nullable: true, precision: 22, scale: 8 })
  totalSupply: string;

  @Column()
  @IsBoolean()
  isActive: boolean;

  @Column()
  @IsBoolean()
  isFiat: boolean;

  @Column()
  @IsBoolean()
  isBlockchainNative: boolean;

  @OneToMany(
    () => TokenBlockchain,
    (tokenBlockchain) => tokenBlockchain.tokenInfo,
  )
  tokenBlockchains: TokenBlockchain[];

  @Column({ nullable: true })
  @IsNumber()
  mainTokenBlockchainId: number;

  @ManyToOne(() => TokenBlockchain, { nullable: true })
  @JoinColumn({ name: 'mainTokenBlockchainId' })
  mainTokenBlockchain: TokenBlockchain;
}
