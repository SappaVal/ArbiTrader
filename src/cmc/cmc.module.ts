import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CmcController } from './cmc.controller';
import { CmcService } from './cmc.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [CmcController],
  providers: [CmcService],
})
export class CmcModule {}
