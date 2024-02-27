import { IsNumber, IsString } from 'class-validator';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Blockchain } from './blockchain.entity';
import { TokenInfos } from './token.entity';
import { BaseTable } from './base/base.table';

@Entity()
export class TokenBlockchain extends BaseTable {
  @Column()
  @IsNumber()
  tokenInfoId: number;

  @Column()
  @IsNumber()
  blockchainId: number;

  @Column()
  @IsString()
  contract: string;

  @ManyToOne(() => TokenInfos, { nullable: false })
  @JoinColumn({ name: 'tokenInfoId' })
  tokenInfo: TokenInfos;

  @ManyToOne(() => Blockchain, { nullable: false })
  @JoinColumn({ name: 'blockchainId' })
  blockchain: Blockchain;

  @OneToMany(() => TokenInfos, (tokenInfos) => tokenInfos.mainTokenBlockchain)
  tokenInfos: TokenInfos[];
}
