import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { DailyPriceResultDto } from 'src/shared/dto/daily-price-result.dto';
@Injectable()
export class CryptoPriceAggregatorService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCurrentPriceFromCache(): Promise<DailyPriceResultDto[]> {
    const cachedData = await this.cacheManager.get('cryptoPrices');
    if (cachedData) {
      return cachedData as DailyPriceResultDto[];
    } else {
      console.log('No cached data');
      return [];
    }
  }
}
