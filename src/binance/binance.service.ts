import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { map } from 'rxjs/operators';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TradingPair } from 'src/entities/trading-pair.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { DailyCronResultDto } from './dto/daily-cron-result.dto';
import { TradingPairDto } from './dto/trading-pair.dto';
import { lastValueFrom } from 'rxjs';
import { Exchange } from 'src/entities/exchange.entity';

@Injectable()
export class BinanceService {
  constructor(
    private httpService: HttpService,
    @InjectRepository(TradingPair)
    private tradingPairRepository: Repository<TradingPair>,
    @InjectRepository(HistoricalPrice)
    private historicalPriceRepository: Repository<HistoricalPrice>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
  ) {}

  private readonly baseUrl = 'https://api.binance.com/api/v3';

  async getHistoricalData(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<HistoricalPrice[]> {
    const whereConditions = {
      tradingPair: { symbol },
      interval,
    };

    if (startTime !== undefined) {
      whereConditions['openTime'] = MoreThanOrEqual(startTime);
    }
    if (endTime !== undefined) {
      whereConditions['closeTime'] = LessThanOrEqual(endTime);
    }
    const queryOptions: any = {
      where: whereConditions,
      order: { openTime: 'DESC' },
    };

    if (limit !== undefined) {
      queryOptions.take = limit;
    }

    const historicalDatas =
      await this.historicalPriceRepository.find(queryOptions);

    return historicalDatas;
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async addExchangeInfo(): Promise<TradingPairDto[]> {
    const exchange = await this.exchangeRepository.findOne({
      where: { name: 'Binance' },
    });
    const url = `${this.baseUrl}/exchangeInfo`;

    const response = await this.httpService.get(url).toPromise();
    const allSymbols = response.data.symbols;
    const usdtPairs: TradingPairDto[] = allSymbols
      .filter((symbol) => symbol.symbol.endsWith('USDT'))
      .map((symbol) => {
        return { pair: symbol.symbol } as TradingPairDto;
      });

    for (const dataDto of usdtPairs) {
      await this.tradingPairRepository.upsert(
        {
          symbol: dataDto.pair,
          exchangeId: exchange.id,
        },
        ['symbol', 'exchangeId'],
      );
    }
    return usdtPairs;
  }

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  async handleDailyCron(): Promise<DailyCronResultDto[]> {
    console.log('Cron job started');
    const results: DailyCronResultDto[] = [];

    const tradingPairs = await this.tradingPairRepository.find();
    const interval = '1d';

    for (const tradingPair of tradingPairs) {
      let limit = 500;
      let startTime = 0;
      console.log('Fetching historical data for', tradingPair.symbol);
      const latestHistoricalPrice =
        await this.historicalPriceRepository.findOne({
          where: { tradingPair: tradingPair },
          order: { openTime: 'DESC' },
        });
      if (latestHistoricalPrice) {
        startTime = latestHistoricalPrice.openTime;
      }

      const historicalDataDtos = await this.getBinanceHistoricalData(
        tradingPair.symbol,
        interval,
        startTime,
        null,
        limit,
      );

      console.log('Historical data added : ', historicalDataDtos.length);
      results.push(
        new DailyCronResultDto(tradingPair.symbol, historicalDataDtos.length),
      );
      for (const dataDto of historicalDataDtos) {
        await this.historicalPriceRepository.upsert(
          {
            ...dataDto,
            tradingPair: tradingPair,
          },
          ['openTime', 'closeTime', 'interval', 'tradingPairId'],
        );
      }
    }

    return results;
  }

  private async getBinanceHistoricalData(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<HistoricalPrice[]> {
    const url = `${this.baseUrl}/klines`;
    const params = { symbol, interval, startTime, endTime, limit };

    const response = await lastValueFrom(
      this.httpService
        .get(url, { params })
        .pipe(map((response) => response.data)),
    );

    const historicalDataDtos = response.map((data) => {
      const historicalPrice = new HistoricalPrice();
      historicalPrice.openTime = data[0];
      historicalPrice.open = data[1];
      historicalPrice.high = data[2];
      historicalPrice.low = data[3];
      historicalPrice.close = data[4];
      historicalPrice.volume = data[7];
      historicalPrice.closeTime = data[6];
      historicalPrice.interval = interval;

      return historicalPrice;
    });

    return historicalDataDtos;
  }
}
