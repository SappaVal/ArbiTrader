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
import { TokenInfos } from 'src/entities/token-infos.entity';
import { Repository } from 'typeorm';
import { CreateTokenInfoDto } from './dto/create-token-info.dto';
import { UpdateTokenInfoDto } from './dto/update-token-info.dto';

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

    if (
      (await this.tokenInfosRepository.count({ where: { contractAddress } })) >
      0
    ) {
      throw new ConflictException('Token already exists');
    }

    if (!this.isValidEthAddress(contractAddress)) {
      throw new BadRequestException('Invalid address');
    }

    const contractABI = await this.getABI(contractAddress);

    const erc20Contract = new ethers.Contract(
      contractAddress,
      contractABI,
      this.ethersProvider,
    );

    const tokenInfo = this.tokenInfosRepository.create({
      contractAddress: contractAddress,
      name: await this.getContractProperty(erc20Contract, 'name'),
      symbol: await this.getContractProperty(erc20Contract, 'symbol'),
      totalSupply: await this.getTotalSupply(erc20Contract),
      abiJson: contractABI,
    });

    return this.tokenInfosRepository.save(tokenInfo);
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
        `Unable to retrieve ${propertyName} from contract. ${error}`,
      );
    }
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
    const decimals = await etherContract.decimals();

    const totalSupplyFormatted = ethers.formatUnits(totalSupplyWei, decimals);

    if (totalSupplyFormatted !== undefined && totalSupplyFormatted !== null) {
      return totalSupplyFormatted;
    }

    throw new BadRequestException('Unable to retrieve total supply');
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
