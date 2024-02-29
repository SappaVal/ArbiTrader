import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

export abstract class BaseTable {
  @ApiProperty({ example: 1, description: 'The id of the record' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ example: '2021-09-01T00:00:00.000Z', description: 'The date the record was created' })
  @CreateDateColumn()
  createdAt: Date

  @ApiProperty({ example: '2021-09-01T00:00:00.000Z', description: 'The date the record was last updated' })
  @UpdateDateColumn()
  updatedAt: Date
}
