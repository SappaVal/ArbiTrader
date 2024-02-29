import { ApiExtraModels, ApiProperty, ApiTags } from '@nestjs/swagger'
import { IsBoolean, IsString } from 'class-validator'
import { Column, Entity, Index, OneToMany } from 'typeorm'
import { BaseTable } from './base/base.table'
import { TokenBlockchain } from './token-blockchain.entity'

@Entity()
@Index('unique_name_symbol_slug', ['name', 'symbol', 'slug'], { unique: true })
@ApiTags('TokenInfos')
@ApiExtraModels(TokenBlockchain)
export class TokenInfos extends BaseTable {
  @Column()
  @IsString()
  @ApiProperty({ example: 'Shiba Inu', description: 'The name of the token' })
  name: string

  @Column()
  @IsString()
  @ApiProperty({ example: 'SHIB', description: 'The symbol of the token' })
  symbol: string

  @Column()
  @IsString()
  @ApiProperty({ example: 'shiba-inu', description: 'The slug of the token' })
  slug: string

  @Column('decimal', { nullable: true, precision: 25, scale: 8 })
  @ApiProperty({ example: '10.000.000.000,000', description: 'The maximum supply of the token' })
  maxSupply: string

  @Column('decimal', { nullable: true, precision: 25, scale: 8 })
  @ApiProperty({ example: '10.000.000.000,000', description: 'The circulating supply of the token' })
  circulatingSupply: string

  @Column('decimal', { nullable: true, precision: 25, scale: 8 })
  @ApiProperty({ example: '10.000.000.000,000', description: 'The total supply of the token' })
  totalSupply: string

  @Column()
  @IsBoolean()
  @ApiProperty({ example: true, description: 'Indicates whether the token is active' })
  isActive: boolean

  @Column()
  @IsBoolean()
  @ApiProperty({ example: false, description: 'Indicates whether the token is considered fiat' })
  isFiat: boolean

  @Column()
  @IsBoolean()
  @ApiProperty({ example: false, description: 'Indicates whether the token is native to a blockchain' })
  isBlockchainNative: boolean

  @OneToMany(() => TokenBlockchain, (tokenBlockchain) => tokenBlockchain.tokenInfo)
  tokenBlockchains: TokenBlockchain[]
}
