import { Module } from '@nestjs/common';
import { CmcService } from './cmc.service';
import { CmcController } from './cmc.controller';

@Module({
  controllers: [CmcController],
  providers: [CmcService],
})
export class CmcModule {}
