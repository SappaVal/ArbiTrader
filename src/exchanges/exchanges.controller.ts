import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { ExchangesService } from './exchanges.service';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { DailyUpdateCronService } from './cron/daily-update.cron';
import { DailyCronResultDto } from 'src/shared/dto/daily-cron-result.dto';
import { TradingPairDto } from 'src/shared/dto/trading-pair.dto';

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
    return this.dailyCronUpdateService.handleDailyCron();
  }

  @Get('launch-manual-pairs-cron')
  launchManualPairsCron(): Promise<TradingPairDto[]> {
    return this.dailyCronUpdateService.handleTradingPairInfo();
  }
}
