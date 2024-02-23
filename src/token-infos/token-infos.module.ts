import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenInfos } from 'src/entities/token-infos.entity';
import { TokenInfosController } from './token-infos.controller';
import { TokenInfosService } from './token-infos.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([TokenInfos])],

  controllers: [TokenInfosController],
  providers: [TokenInfosService],
})
export class TokenInfosModule {}
