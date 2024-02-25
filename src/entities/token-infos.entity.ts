import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Blockchain } from './blockchain.entity';

@Entity()
@Unique(['contractAddress', 'blockchainId'])
export class TokenInfos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  contractAddress: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  totalSupply: string;

  @Column('jsonb')
  abiJson: Record<string, any>;

  @ManyToOne(() => Blockchain, (blockchain) => blockchain.tokenInfos)
  @JoinColumn({ name: 'blockchainId' })
  blockchain: Blockchain;

  @Column({ nullable: false })
  blockchainId: number;
}
