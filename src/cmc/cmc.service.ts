import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';

@Injectable()
export class CmcService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  getCryptoInfo(cryptoSymbol: string) {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${cryptoSymbol}`;
    const headersRequest = {
      'X-CMC_PRO_API_KEY': this.configService.get<string>('CMC_PRO_API_KEY'),
    };

    return this.httpService
      .get(url, { headers: headersRequest })
      .pipe(map((response) => (response as ApiResponse).data));
  }
}

interface ApiResponse {
  data: any;
}
