import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BybitService } from './bybit.service';
@Module({
  imports: [HttpModule],
  providers: [BybitService],
})
export class BybitModule {}
