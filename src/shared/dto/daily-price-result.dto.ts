export class DailyPriceResultDto {
  symbol: string;
  volume: number;
  price: number;

  constructor(symbol: string, volume: number, price: number) {
    this.symbol = symbol;
    this.price = price;
    this.volume = volume;
  }
}
