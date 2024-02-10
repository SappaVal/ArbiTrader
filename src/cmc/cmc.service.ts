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

  async getAirdrops() {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/airdrops`;
    const headersRequest = {
      'X-CMC_PRO_API_KEY': this.configService.get<string>('CMC_PRO_API_KEY'),
    };

    try {
      const response = await this.httpService
        .get(url, { headers: headersRequest })
        .toPromise(); // Assurez-vous d'utiliser toPromise() si vous travaillez avec des Promises.
      return response.data;
    } catch (error) {
      console.error('Error: ', error.response.data.status);
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un statut hors de la plage 2xx
        console.error(
          `Error: ${error.response.status} - ${error.response.data}`,
        );
      } else if (error.request) {
        console.error(`Error: No response from server.`);
      } else {
        // Quelque chose s'est produit lors de la configuration de la requête qui a déclenché une Erreur
        console.error(`Error: ${error.message}`);
      }
    }
  }
}

interface ApiResponse {
  data: any;
  status: any;
}
