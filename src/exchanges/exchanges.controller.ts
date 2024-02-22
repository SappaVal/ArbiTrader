import { Controller, Get, Param, Query } from '@nestjs/common';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { DailyCronResultDto } from 'src/shared/dto/daily-cron-result.dto';
import { DailyUpdateCronService } from './cron/daily-update.cron';
import { TradingPairResultInfoDto } from './dto/trading-pair-result-info.dto';
import { ExchangesService } from './exchanges.service';

@Controller('exchanges')
export class ExchangesController {
  constructor(
    private readonly exchangesService: ExchangesService,
    private readonly dailyCronUpdateService: DailyUpdateCronService,
  ) {}
  @Get('historical-data/:exchange')
  getHistoricalData(
    @Param('exchange') exchange: string,
    @Query('symbol') symbol: string,
    @Query('interval') interval: string,
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
    @Query('limit') limit?: number,
  ): Promise<HistoricalPrice[]> {
    return this.exchangesService.getHistoricalData(
      exchange,
      symbol,
      interval,
      startTime,
      endTime,
      limit,
    );
  }

  @Get('pair/:exchange')
  getPairByExchange(@Param('exchange') exchange: string): Promise<string[]> {
    return this.exchangesService.getPairByExchange(exchange);
  }

  @Get('launch-manual-history-cron')
  launchManualCron(): Promise<DailyCronResultDto[]> {
    return this.dailyCronUpdateService.handleHistoricalDataCron();
  }

  @Get('launch-manual-pairs-cron')
  launchManualPairsCron(): Promise<TradingPairResultInfoDto> {
    return this.dailyCronUpdateService.handleTradingPairInfoCron();
  }
}
