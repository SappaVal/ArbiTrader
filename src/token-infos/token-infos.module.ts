import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TokenInfos } from 'src/entities/token.entity'
import { TokenInfosController } from './token-infos.controller'
import { TokenInfosService } from './token-infos.service'
import { Blockchain } from 'src/entities/blockchain.entity'
import { TokenBlockchain } from 'src/entities/token-blockchain.entity'

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([TokenInfos, Blockchain, TokenBlockchain])],

  controllers: [TokenInfosController],
  providers: [TokenInfosService],
})
export class TokenInfosModule {}
