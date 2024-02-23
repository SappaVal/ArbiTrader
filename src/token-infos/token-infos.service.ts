import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { CreateTokenInfoDto } from './dto/create-token-info.dto';
import { UpdateTokenInfoDto } from './dto/update-token-info.dto';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class TokenInfosService {
  private ethersProvider: ethers.JsonRpcProvider;
  private etherScanBaseUrl =
    'https://api.etherscan.io/api?module=contract&action=getabi';
  private infuraBaseUrl = 'https://mainnet.infura.io/v3/';

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.etherScanBaseUrl +=
      '&apikey=' + configService.get<string>('ETHERSCAN_API_KEY');
    this.ethersProvider = new ethers.JsonRpcProvider(
      this.infuraBaseUrl + configService.get<string>('INFURA_API_KEY'),
    );
  }

  async create(createTokenInfoDto: CreateTokenInfoDto) {
    const contractAddress = createTokenInfoDto.contractAddress;

    if (!this.isValidEthAddress(contractAddress)) {
      throw new BadRequestException('Invalid address');
    }

    const contractABI = await this.getABI(contractAddress);
    if (!contractABI) {
      throw new BadRequestException('Unable to retrieve ABI from contract');
    }

    const totalSupply = await this.getTotalSupply(contractAddress, contractABI);

    if (!totalSupply) {
      throw new BadRequestException('Unable to retrieve total supply');
    }

    return {
      contractAddress: contractAddress,
      totalSupply: totalSupply,
    };
  }

  private isValidEthAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  private async getABI(contractAddress: string): Promise<any | null> {
    console.log(
      'contractAddress',
      this.etherScanBaseUrl + `&address=${contractAddress}`,
    );
    const response = await lastValueFrom(
      this.httpService
        .get(this.etherScanBaseUrl + `&address=${contractAddress}`)
        .pipe(map((response) => response.data)),
    );

    if (response?.data?.status === '1' && response?.data?.message === 'OK') {
      return JSON.parse(response.data.result);
    }

    return null;
  }

  async getTotalSupply(
    contractAddress: string,
    contractABI: any,
  ): Promise<string | null> {
    const erc20Contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.ethersProvider,
    );

    const totalSupplyWei = await erc20Contract.totalSupply();

    if (totalSupplyWei !== undefined && totalSupplyWei !== null) {
      return ethers.formatUnits(totalSupplyWei, 'ether');
    }
    return null;
  }

  findAll() {
    return `This action returns all tokenInfos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tokenInfo`;
  }

  update(id: number, updateTokenInfoDto: UpdateTokenInfoDto) {
    return `This action updates a #${id} tokenInfo`;
  }

  remove(id: number) {
    return `This action removes a #${id} tokenInfo`;
  }
}
