import { RequestTradingPairDto } from '../../shared/dto/trading-pair.dto';

export class ExchangeResultsDto {
  results: RequestTradingPairDto[];
  length: number;
}

export class TradingPairResultInfoDto {
  bybit: ExchangeResultsDto;
  binance: ExchangeResultsDto;
}
