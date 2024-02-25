import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TokenInfos } from './token-infos.entity';

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

  @OneToMany(() => TokenInfos, (tokenInfos) => tokenInfos.blockchainId)
  tokenInfos: TokenInfos[];
}
