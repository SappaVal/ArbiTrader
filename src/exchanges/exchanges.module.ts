import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinanceService } from 'src/binance/binance.service';
import { BybitService } from 'src/bybit/bybit.service';
import { Exchange } from 'src/entities/exchange.entity';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TradingPair } from 'src/entities/trading-pair.entity';
import { ExchangesController } from './exchanges.controller';
import { ExchangesService } from './exchanges.service';
import { DailyUpdateCronService } from './cron/daily-update.cron';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exchange, HistoricalPrice, TradingPair]),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ExchangesController],
  providers: [
    ExchangesService,
    BybitService,
    BinanceService,
    DailyUpdateCronService,
  ],
  exports: [ExchangesService],
})
export class ExchangesModule {}
