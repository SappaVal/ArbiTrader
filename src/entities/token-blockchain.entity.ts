import { IsNumber, IsString } from 'class-validator';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTable } from './base/base.table';
import { Blockchain } from './blockchain.entity';
import { TokenInfos } from './token.entity';

@Entity()
@Index('unique_tokenInfoId_blockchainId', ['tokenInfoId', 'blockchainId'], {
  unique: true,
})
export class TokenBlockchain extends BaseTable {
  @Column()
  @IsNumber()
  tokenInfoId: number;

  @Column()
  @IsNumber()
  blockchainId: number;

  @Column({ nullable: false })
  @IsString()
  contract: string;

  @ManyToOne(() => TokenInfos, { nullable: false })
  @JoinColumn({ name: 'tokenInfoId' })
  tokenInfo: TokenInfos;

  @ManyToOne(() => Blockchain, { nullable: false })
  @JoinColumn({ name: 'blockchainId' })
  blockchain: Blockchain;
}
