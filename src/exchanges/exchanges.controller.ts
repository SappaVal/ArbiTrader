import { Controller, Get, Param, Query } from '@nestjs/common';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { DailyCronResultDto } from 'src/shared/dto/daily-cron-result.dto';
import { DailyUpdateCronService } from './cron/daily-update.cron';
import { TradingPairResultInfoDto } from './dto/trading-pair-result-info.dto';
import { ExchangesService } from './exchanges.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Exchanges')
@Controller('exchanges')
export class ExchangesController {
  constructor(
    private readonly exchangesService: ExchangesService,
    private readonly dailyCronUpdateService: DailyUpdateCronService,
  ) {}

  @ApiOperation({
    summary: 'Historical price',
    description: 'Get historical price data from exchange',
  })
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

  @ApiOperation({
    summary: 'Pair by exchange',
    description: 'Get trading pair by exchange',
  })
  @Get('pair/:exchange')
  getPairByExchange(@Param('exchange') exchange: string): Promise<string[]> {
    return this.exchangesService.getPairByExchange(exchange);
  }

  @ApiOperation({
    summary: 'Manual history cron',
    description: 'Launch manual history cron job',
  })
  @Get('launch-manual-history-cron')
  launchManualCron(): Promise<DailyCronResultDto[]> {
    return this.dailyCronUpdateService.handleHistoricalDataCron();
  }

  @ApiOperation({
    summary: 'Manual pairs cron',
    description: 'Launch manual pairs cron job',
  })
  @Get('launch-manual-pairs-cron')
  launchManualPairsCron(): Promise<TradingPairResultInfoDto> {
    return this.dailyCronUpdateService.handleTradingPairInfoCron();
  }
}
