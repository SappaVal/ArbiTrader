import { Controller, Get, Query } from '@nestjs/common';
import { BinanceService } from './binance.service';
import { TradingPairDto } from './dto/trading-pair.dto';
import { DailyCronResultDto } from './dto/daily-cron-result.dto';
import { HistoricalDataDto } from './dto/historical-data.dto';
import { HistoricalPrice } from 'src/entities/historical-price.entity';

@Controller('binance')
export class BinanceController {
  constructor(private readonly binanceService: BinanceService) {}

  @Get('historical-data')
  getHistoricalData(
    @Query('symbol') symbol: string,
    @Query('interval') interval: string,
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
    @Query('limit') limit?: number,
  ): Promise<HistoricalPrice[]> {
    return this.binanceService.getHistoricalData(
      symbol,
      interval,
      startTime,
      endTime,
      limit,
    );
  }

  @Get('add-usdt-pairs')
  insertExchangeInfo(): Promise<TradingPairDto[]> {
    return this.binanceService.addExchangeInfo();
  }

  @Get('launch-daily-cron-manually')
  launchCronManually(): Promise<DailyCronResultDto[]> {
    return this.binanceService.handleDailyCron();
  }
}
