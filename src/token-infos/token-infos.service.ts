import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import { lastValueFrom, map } from 'rxjs';
import { Blockchain } from 'src/entities/blockchain.entity';
import { Repository } from 'typeorm';
import { CreateTokenInfoDto } from './dto/create-token-info.dto';
import { UpdateTokenInfoDto } from './dto/update-token-info.dto';
import { TokenInfos } from 'src/entities/token-infos.entity';
import e from 'express';

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
    @InjectRepository(TokenInfos)
    private tokenInfosRepository: Repository<TokenInfos>,
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

    const erc20Contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.ethersProvider,
    );

    const totalSupply = await this.getTotalSupply(erc20Contract);

    const tokenInfo = this.tokenInfosRepository.create({
      contractAddress: contractAddress,
      name: await this.getContractData(() => erc20Contract.name()),
      symbol: await this.getContractData(() => erc20Contract.symbol()),
      totalSupply: totalSupply,
      abiJson: contractABI,
    });

    return this.tokenInfosRepository.save(tokenInfo);
  }

  private isValidEthAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  private async getABI(contractAddress: string): Promise<any | null> {
    const response = await lastValueFrom(
      this.httpService
        .get(this.etherScanBaseUrl + `&address=${contractAddress}`)
        .pipe(map((response) => response.data)),
    );

    if (response?.status === '1' && response?.message === 'OK') {
      return JSON.parse(response.result);
    }

    throw new BadRequestException('Unable to retrieve ABI from contract');
  }

  async getTotalSupply(etherContract: ethers.Contract): Promise<string | null> {
    const totalSupplyWei = await etherContract.totalSupply();

    if (totalSupplyWei !== undefined && totalSupplyWei !== null) {
      return ethers.formatUnits(totalSupplyWei, 'ether');
    }
    throw new BadRequestException('Unable to retrieve total supply');
  }

  async getContractData<T>(
    getDataFunction: () => Promise<T | null>,
  ): Promise<T | null> {
    try {
      return await getDataFunction();
    } catch (error) {
      throw new BadRequestException(
        'Unable to retrieve contract data. ' + error,
      );
    }
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
