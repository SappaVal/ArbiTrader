import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KlinesService } from './klines.service';
import { KlineDto } from './dto/kline.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Charts')
@Controller('klines')
export class KlinesController {
  constructor(private readonly klinesService: KlinesService) {}

  @Get('daily/:symbol')
  async getDailyKlinesBySymbol(@Param('symbol') symbol: string): Promise<KlineDto[]> {
    return this.klinesService.getDailyKlinesBySymbol(symbol);
  }

  @Get('weekly/:symbol')
  async getWeeklyKlinesBySymbol(@Param('symbol') symbol: string): Promise<KlineDto[]> {
    return this.klinesService.getWeeklyKlinesBySymbol(symbol);
  }

  @Get('monthly/:symbol')
  async getMonthlyKlinesBySymbol(@Param('symbol') symbol: string): Promise<KlineDto[]> {
    return this.klinesService.getMonthlyKlinesBySymbol(symbol);
  }

  @Get('yearly/:symbol')
  async getYearlyKlinesBySymbol(@Param('symbol') symbol: string): Promise<KlineDto[]> {
    return this.klinesService.getYearlyKlinesBySymbol(symbol);
  }

  @Get('all/:symbol')
  async getAllKlinesBySymbol(@Param('symbol') symbol: string): Promise<KlineDto[]> {
    return this.klinesService.getAllKlinesBySymbol(symbol);
  }
}
