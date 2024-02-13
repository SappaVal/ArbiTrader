import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { map } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { HistoricalDataDto } from './dto/historical-data.dto';
import { TradingPair } from 'src/entities/trading-pair.entity';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TradingPairDto } from './dto/trading-pair.dto';
import { DailyCronResultDto } from './dto/daily-cron-result.dto';

@Injectable()
export class BinanceService {
  constructor(
    private httpService: HttpService,
    @InjectRepository(TradingPair)
    private tradingPairRepository: Repository<TradingPair>,
    @InjectRepository(HistoricalPrice)
    private historicalPriceRepository: Repository<HistoricalPrice>,
  ) {}

  private readonly baseUrl = 'https://api.binance.com/api/v3';

  async getHistoricalData(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<HistoricalPrice[]> {
    const historicalDatas = await this.historicalPriceRepository.find({
      where: { tradingPair: { symbol }, interval },
      order: { openTime: 'DESC' },
      take: limit,
    });
    return historicalDatas;
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async addExchangeInfo(): Promise<TradingPairDto[]> {
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
        },
        ['symbol'],
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
          where: { tradingPairId: tradingPair.id },
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
            tradingPairId: tradingPair.id,
            interval,
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
  ): Promise<HistoricalDataDto[]> {
    const url = `${this.baseUrl}/klines`;
    const params = { symbol, interval, startTime, endTime, limit };

    const response = await this.httpService
      .get(url, { params })
      .pipe(map((response) => response.data))
      .toPromise();

    const historicalDataDtos = response.map(
      (data) =>
        new HistoricalDataDto(
          data[0],
          data[1],
          data[2],
          data[3],
          data[4],
          data[5],
          data[6],
          data[7],
          data[8],
          data[9],
          data[10],
          data[11],
        ),
    );

    return historicalDataDtos;
  }
}
