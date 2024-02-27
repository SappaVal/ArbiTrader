import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TokenBlockchain } from './token-blockchain.entity';

@Entity()
export class Blockchain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  shortName: string;

  @Column()
  url: string;

  @OneToMany(
    () => TokenBlockchain,
    (tokenBlockchain) => tokenBlockchain.blockchain,
  )
  tokenBlockchains: TokenBlockchain[];
}
