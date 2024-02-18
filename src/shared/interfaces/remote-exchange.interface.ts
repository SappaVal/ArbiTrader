import { HistoricalPrice } from 'src/entities/historical-price.entity';
import { TradingPairDto } from '../dto/trading-pair.dto';

export interface RemoteExchangeInterface {
  getTradingPairInfo(): Promise<TradingPairDto[]>;

  getHistoricalData(
    symbol: string,
    interval: string,
    startTime?: number,
    endTime?: number,
    limit?: number,
  ): Promise<HistoricalPrice[]>;

  getCurrentPrice(symbol: string): Promise<number>;
}
