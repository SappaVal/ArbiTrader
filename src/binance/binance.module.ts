import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TradingPair } from 'src/entities/trading-pair.entity';
import { BinanceController } from './binance.controller';
import { BinanceService } from './binance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistoricalPrice, TradingPair]),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  providers: [BinanceService],
  controllers: [BinanceController],
})
export class BinanceModule {}
