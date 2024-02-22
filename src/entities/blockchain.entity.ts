import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
