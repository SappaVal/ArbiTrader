import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TokenInfos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  contractAddress: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column()
  totalSupply: string;
}
