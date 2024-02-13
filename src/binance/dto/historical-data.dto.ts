export class HistoricalDataDto {
  constructor(
    public openTime: number,
    public open: string,
    public high: string,
    public low: string,
    public close: string,
    public volume: string,
    public closeTime: number,
    public quoteAssetVolume: string,
    public numberOfTrades: number,
    public takerBuyBaseAssetVolume: string,
    public takerBuyQuoteAssetVolume: string,
    public ignore: string,
  ) {}
}
