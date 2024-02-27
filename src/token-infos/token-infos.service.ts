import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { decodeBytes32String, ethers } from 'ethers';
import { lastValueFrom, map } from 'rxjs';
import { TokenInfos } from 'src/entities/token.entity';
import { Repository } from 'typeorm';
import { CreateTokenInfoDto } from './dto/create-token-info.dto';
import { UpdateTokenInfoDto } from './dto/update-token-info.dto';
import { Blockchain } from 'src/entities/blockchain.entity';
import { TokenBlockchain } from './../entities/token-blockchain.entity';

@Injectable()
export class TokenInfosService {
  private ethProvider: ethers.JsonRpcProvider;
  private bscProvider: ethers.JsonRpcProvider;
  private etherScanBaseUrl =
    'https://api.etherscan.io/api?module=contract&action=getabi';
  private infuraBaseUrl = 'https://mainnet.infura.io/v3/';

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(TokenInfos)
    private tokenInfosRepository: Repository<TokenInfos>,
    @InjectRepository(Blockchain)
    private blockchainRepository: Repository<Blockchain>,
    @InjectRepository(TokenBlockchain)
    private tokenBlockchainRepository: Repository<TokenBlockchain>,
  ) {
    this.etherScanBaseUrl +=
      '&apikey=' + configService.get<string>('ETHERSCAN_API_KEY');
    this.ethProvider = new ethers.JsonRpcProvider(
      this.infuraBaseUrl + configService.get<string>('INFURA_API_KEY'),
    );

    this.bscProvider = new ethers.JsonRpcProvider(
      'https://bsc-dataseed.binance.org/',
    );
  }

  async createEthOrBscToken(
    createTokenInfoDto: CreateTokenInfoDto,
  ): Promise<TokenInfos> {
    const contractAddress = createTokenInfoDto.contractAddress;

    const blockchain = await this.blockchainRepository.findOne({
      where: { shortName: createTokenInfoDto.blockchainSymbol },
    });

    if (!blockchain) {
      throw new BadRequestException('Blockchain not found');
    }

    if (!ethers.isAddress(contractAddress)) {
      throw new BadRequestException('Invalid address');
    }

    let tokenInfoEntity: TokenInfos;
    let tokenBlockchainEntity: TokenBlockchain;
    switch (blockchain.shortName) {
      case 'ETH':
      case 'BSC':
        tokenInfoEntity = await this.createStandardToken(contractAddress);
        tokenBlockchainEntity = this.createTokenBlochain(
          contractAddress,
          blockchain,
          tokenInfoEntity,
        );

        break;
      default:
        throw new BadRequestException('Blockchain not supported yet');
    }

    const tokenInfo = await this.tokenInfosRepository.findOne({
      where: {
        slug: tokenInfoEntity.slug,
        symbol: tokenInfoEntity.symbol,
        name: tokenInfoEntity.name,
      },
      relations: ['mainTokenBlockchain', 'mainTokenBlockchain.blockchain'],
    });

    if (
      tokenInfo &&
      tokenInfo.mainTokenBlockchain &&
      tokenInfo.mainTokenBlockchain.blockchain
    ) {
      throw new ConflictException(
        `Token already exists with ${tokenInfo.mainTokenBlockchain.blockchain.shortName} main blockchain`,
      );
    }

    const savedTokenInfo =
      await this.tokenInfosRepository.save(tokenInfoEntity);

    tokenBlockchainEntity.tokenInfo = savedTokenInfo;
    const savedTokenBlockchain = await this.tokenBlockchainRepository.save(
      tokenBlockchainEntity,
    );

    savedTokenInfo.mainTokenBlockchainId = savedTokenBlockchain.id;
    await this.tokenInfosRepository.save(savedTokenInfo);

    return savedTokenInfo;
  }

  async createStandardToken(contractAddress: string): Promise<TokenInfos> {
    const contractABI = await this.getABI(contractAddress);

    const erc20Contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.ethProvider,
    );

    const name = await this.getContractProperty(erc20Contract, 'name');
    const supply = await this.getTotalSupply(erc20Contract);
    return this.tokenInfosRepository.create({
      name: name,
      symbol: await this.getContractProperty(erc20Contract, 'symbol'),
      slug: name.toLowerCase().replace(' ', '-'),
      maxSupply: supply.toString(),
      totalSupply: supply.toString(),
      circulatingSupply: supply.toString(),
      isActive: true,
      isFiat: false,
      isBlockchainNative: false,
    });
  }

  async getContractProperty(
    contract: ethers.Contract,
    propertyName: string,
  ): Promise<string | null> {
    try {
      const propertyFunctionAbi = contract.interface.getFunction(propertyName);

      if (propertyFunctionAbi == null)
        throw new Error(`No ${propertyName} function found in the contract`);

      const outputType = propertyFunctionAbi.outputs[0].type;
      const propertyResult = await (contract[propertyName] as Function)();

      let convertedResult: string | null;

      if (outputType === 'string') {
        convertedResult = propertyResult;
      } else if (outputType === 'bytes32') {
        convertedResult = decodeBytes32String(propertyResult);
      } else {
        throw new Error(
          `Unsupported output type for ${propertyName}: ${outputType}`,
        );
      }
      return convertedResult;
    } catch (error) {
      throw new BadRequestException(
        `Unable to retrieve ${propertyName}() from contract. ${error}`,
      );
    }
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
    const decimals = await etherContract.decimals();

    const totalSupplyFormatted = ethers.formatUnits(totalSupplyWei, decimals);

    if (totalSupplyFormatted !== undefined && totalSupplyFormatted !== null) {
      return totalSupplyFormatted;
    }

    throw new BadRequestException('Unable to retrieve total supply');
  }

  createTokenBlochain(
    contract: string,
    blockchain: Blockchain,
    tokenInfo: TokenInfos,
  ): TokenBlockchain {
    return this.tokenBlockchainRepository.create({
      contract: contract,
      blockchain: blockchain,
      tokenInfo: tokenInfo,
    });
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
