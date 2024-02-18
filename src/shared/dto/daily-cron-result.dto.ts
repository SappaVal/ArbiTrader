export class DailyCronResultDto {
  symbol: string;
  historicalDataCount: number;

  constructor(symbol: string, historicalDataCount: number) {
    this.symbol = symbol;
    this.historicalDataCount = historicalDataCount;
  }
}
