import { Module } from '@nestjs/common';
import { KlinesService } from './klines.service';
import { KlinesController } from './klines.controller';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([HistoricalPrice])],
  controllers: [KlinesController],
  providers: [KlinesService],
})
export class KlinesModule {}
