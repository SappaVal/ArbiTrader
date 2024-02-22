import { Module } from '@nestjs/common';
import { TokenInfosService } from './token-infos.service';
import { TokenInfosController } from './token-infos.controller';

@Module({
  controllers: [TokenInfosController],
  providers: [TokenInfosService],
})
export class TokenInfosModule {}
