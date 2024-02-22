import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BinanceService } from 'src/binance/binance.service';
import { BinanceIntervalEnum } from 'src/binance/enum/binance-interval-enum';
import { BybitService } from 'src/bybit/bybit.service';
import { BybitIntervalEnum } from 'src/bybit/enum/bybit-interval-enum.';
import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TradingPair } from 'src/entities/trading-pair.entity';
import { DailyCronResultDto } from 'src/shared/dto/daily-cron-result.dto';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RequestTradingPairDto } from 'src/shared/dto/trading-pair.dto';
import { Exchange } from 'src/entities/exchange.entity';
import { TradingPairResultInfoDto } from '../dto/trading-pair-result-info.dto';
import { ExchangesService } from '../exchanges.service';

@Injectable()
export class DailyUpdateCronService {
  private readonly logger = new Logger(DailyUpdateCronService.name);

  constructor(
    @InjectRepository(TradingPair)
    private tradingPairRepository: Repository<TradingPair>,
    @InjectRepository(HistoricalPrice)
    private historicalPriceRepository: Repository<HistoricalPrice>,
    @InjectRepository(Exchange)
    private exchangeRepository: Repository<Exchange>,
    private bybitService: BybitService,
    private binanceService: BinanceService,
    private exchangesService: ExchangesService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleHistoricalDataCron(): Promise<DailyCronResultDto[]> {
    const results: DailyCronResultDto[] = [];
    const bybitResults = await this.handleDailyCronByExchange('bybit');
    const binanceResults = await this.handleDailyCronByExchange('binance');

    results.push(...bybitResults);
    results.push(...binanceResults);

    return results;
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleTradingPairInfoCron(): Promise<TradingPairResultInfoDto> {
    const bybitResults = await this.handleTradingPairInfoByExchange('bybit');
    await this.RemoveOldPairs(bybitResults, 'bybit');

    const binanceResults =
      await this.handleTradingPairInfoByExchange('binance');
    await this.RemoveOldPairs(binanceResults, 'binance');

    return {
      bybit: { results: bybitResults, length: bybitResults.length },
      binance: { results: binanceResults, length: binanceResults.length },
    };
  }

  private async RemoveOldPairs(
    exchangeResult: RequestTradingPairDto[],
    exchangeName: string,
  ) {
    const exchangePairs = exchangeResult.map((result) => result.pair);
    const bybitPairsPostgres =
      await this.exchangesService.getPairByExchange(exchangeName);

    const extraElements = bybitPairsPostgres.filter(
      (item) => !exchangePairs.includes(item),
    );

    if (extraElements.length > 0) {
      console.log(
        'Extra elements in internal database for' +
          exchangeName +
          ': ' +
          extraElements,
      );
    }

    // TODO mettre id a 0 dans la table trading pair avec comme symbol le symbole trouvé et l'id de l'exchange
  }

  private async handleTradingPairInfoByExchange(
    exchangeName: string,
  ): Promise<RequestTradingPairDto[]> {
    exchangeName = exchangeName.toLowerCase();
    this.logger.debug('Getting trading pairs for exchange : ' + exchangeName);
    const exchange = await this.exchangeRepository.findOne({
      where: { name: exchangeName },
    });

    const usdtPairs = await this.getTradingPairInfoByExchange(exchangeName);

    for (const dataDto of usdtPairs) {
      await this.tradingPairRepository.upsert(
        {
          symbol: dataDto.pair,
          exchangeId: exchange.id,
        },
        ['symbol', 'exchangeId'],
      );
    }
    this.logger.debug('Finishing Trading pairs for exchange : ' + exchangeName);
    return usdtPairs;
  }

  private async getTradingPairInfoByExchange(
    exchangeName: string,
  ): Promise<RequestTradingPairDto[]> {
    if (exchangeName === 'bybit') {
      return this.bybitService.getTradingPairInfo();
    } else if (exchangeName === 'binance') {
      return this.binanceService.getTradingPairInfo();
    }

    throw new Error('TradingPairInfo not found for exchange : ' + exchangeName);
  }

  private async handleDailyCronByExchange(
    exchangeName: string,
  ): Promise<DailyCronResultDto[]> {
    exchangeName = exchangeName.toLowerCase();
    const results: DailyCronResultDto[] = [];
    const interval = this.getDailyIntervalByExchange(exchangeName);

    this.logger.debug('Daily Cron job started for exchange : ' + exchangeName);

    const tradingPairs = await this.tradingPairRepository.find({
      where: { exchange: { name: exchangeName } },
    });

    this.logger.debug(
      'Trading pairs for: ' + exchangeName + ' ' + tradingPairs.length,
    );

    const historicalDataPromises = tradingPairs.map(async (tradingPair) => {
      let limit = 1000;
      let startTime = 0;

      const latestHistoricalPrice =
        await this.historicalPriceRepository.findOne({
          where: { tradingPairId: tradingPair.id },
          order: { openTime: 'DESC' },
        });
      if (latestHistoricalPrice) {
        startTime = latestHistoricalPrice.openTime;
      }

      const historicalDataDtos = await this.getHistoricalDataByExchange(
        exchangeName,
        tradingPair,
        interval,
        startTime,
        limit,
      );

      const upsertPromises = historicalDataDtos.map(async (dataDto) =>
        this.historicalPriceRepository.upsert(
          {
            ...dataDto,
            tradingPair: tradingPair,
          },
          ['openTime', 'closeTime', 'interval', 'tradingPairId'],
        ),
      );
      await Promise.all(upsertPromises);

      return new DailyCronResultDto(
        tradingPair.symbol,
        historicalDataDtos.length,
      );
    });

    const allResults = await Promise.all(historicalDataPromises);
    results.push(...allResults);
    this.logger.debug('Daily Cron job finished for exchange : ' + exchangeName);

    return results;
  }

  private getDailyIntervalByExchange(exchangeName: string): string {
    if (exchangeName === 'bybit') {
      return BybitIntervalEnum.DAILY;
    } else if (exchangeName === 'binance') {
      return BinanceIntervalEnum.DAILY;
    }

    throw new Error('Interval not found for exchange : ' + exchangeName);
  }

  private getHistoricalDataByExchange(
    exchangeName: string,
    tradingPair: TradingPair,
    interval: string,
    startTime: number,
    limit: number,
  ): Promise<HistoricalPrice[]> {
    if (exchangeName === 'bybit') {
      return this.bybitService.getHistoricalData(
        tradingPair.symbol,
        interval,
        startTime,
        null,
        limit,
      );
    } else if (exchangeName === 'binance') {
      return this.binanceService.getHistoricalData(
        tradingPair.symbol,
        interval,
        startTime,
        null,
        limit,
      );
    }

    throw new Error('HistoricalData not found for exchange : ' + exchangeName);
  }
}
