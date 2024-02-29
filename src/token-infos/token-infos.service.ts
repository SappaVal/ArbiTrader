import { HttpService } from '@nestjs/axios'
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { decodeBytes32String, ethers } from 'ethers'
import { lastValueFrom, map } from 'rxjs'
import { Blockchain } from 'src/entities/blockchain.entity'
import { TokenInfos } from 'src/entities/token.entity'
import { Repository } from 'typeorm'
import { TokenBlockchain } from './../entities/token-blockchain.entity'
import { CreateTokenInfoDto } from './dto/create-token-info.dto'
import { UpdateTokenInfoDto } from './dto/update-token-info.dto'

@Injectable()
export class TokenInfosService {
  private ethProvider: ethers.JsonRpcProvider
  private etherScanBaseUrl = 'https://api.etherscan.io/api?module=contract&action=getabi'
  private bscScanBaseUrl = 'https://api.bscscan.com/api?module=contract&action=getabi'
  private infuraBaseUrl = 'https://mainnet.infura.io/v3/'

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
    this.etherScanBaseUrl += '&apikey=' + configService.get<string>('ETHERSCAN_API_KEY')
    this.bscScanBaseUrl += '&apikey=' + configService.get<string>('BSCSCAN_API_KEY')
    this.ethProvider = new ethers.JsonRpcProvider(this.infuraBaseUrl + configService.get<string>('INFURA_API_KEY'))
  }

  async createStandardToken(createTokenInfoDto: CreateTokenInfoDto, blockchainSymbol: string): Promise<TokenInfos> {
    const contractAddress = createTokenInfoDto.contractAddress

    const blockchain = await this.blockchainRepository.findOne({
      where: { shortName: blockchainSymbol },
    })

    if (!blockchain) {
      throw new BadRequestException('Blockchain not found')
    }

    if (!ethers.isAddress(contractAddress)) {
      throw new BadRequestException('Invalid contract')
    }

    const tokenInfoEntity = await this.createTokenEntity(contractAddress, blockchain)
    const tokenBlockchainEntity = this.createTokenBlochainEntity(contractAddress, blockchain, tokenInfoEntity)

    let tokenInfo = await this.tokenInfosRepository.findOne({
      where: {
        slug: tokenInfoEntity.slug,
        symbol: tokenInfoEntity.symbol,
        name: tokenInfoEntity.name,
      },
      relations: ['tokenBlockchains'],
    })

    if (!tokenInfo) {
      tokenInfo = await this.tokenInfosRepository.save(tokenInfoEntity)
    } else {
      const tokenBlockchain = tokenInfo.tokenBlockchains.find((t) => t.blockchainId === blockchain.id)

      if (tokenBlockchain) {
        throw new ConflictException(
          `Blockchain ${blockchain.shortName} already has token ${tokenInfo.name} with contract ${contractAddress}`,
        )
      }
    }

    tokenBlockchainEntity.tokenInfo = tokenInfo
    await this.tokenBlockchainRepository.save(tokenBlockchainEntity)

    tokenInfo = await this.tokenInfosRepository.findOne({
      where: {
        id: tokenInfo.id,
      },
      relations: ['tokenBlockchains'],
    })

    return tokenInfo
  }

  async createTokenEntity(contractAddress: string, blockchain: Blockchain): Promise<TokenInfos> {
    const contractABI = await this.getABI(contractAddress, blockchain.shortName)

    const standardTokenContract = new ethers.Contract(contractAddress, contractABI, this.ethProvider)

    const name = await this.getContractProperty(standardTokenContract, 'name')
    const supply = await this.getTotalSupply(standardTokenContract)
    return this.tokenInfosRepository.create({
      name: name,
      symbol: await this.getContractProperty(standardTokenContract, 'symbol'),
      slug: name.toLowerCase().replace(' ', '-'),
      maxSupply: supply.toString(),
      totalSupply: supply.toString(),
      circulatingSupply: supply.toString(),
      isActive: true,
      isFiat: false,
      isBlockchainNative: false,
    })
  }

  async getContractProperty(contract: ethers.Contract, propertyName: string): Promise<string | null> {
    try {
      const propertyFunctionAbi = contract.interface.getFunction(propertyName)

      if (propertyFunctionAbi == null)
        throw new BadRequestException(`No ${propertyName} function found in the contract`)

      const outputType = propertyFunctionAbi.outputs[0].type
      const propertyResult = await (contract[propertyName] as Function)()

      let convertedResult: string | null

      if (outputType === 'string') {
        convertedResult = propertyResult
      } else if (outputType === 'bytes32') {
        convertedResult = decodeBytes32String(propertyResult)
      } else {
        throw new BadRequestException(`Unsupported output type for ${propertyName}: ${outputType}`)
      }
      return convertedResult
    } catch (error) {
      throw new BadRequestException(`Unable to retrieve ${propertyName}() from contract. ${error}`)
    }
  }

  private async getABI(contractAddress: string, shortName: string): Promise<any | null> {
    let baseUrl: string

    switch (shortName) {
      case 'ETH':
        baseUrl = this.etherScanBaseUrl
        break
      case 'BSC':
        baseUrl = this.bscScanBaseUrl
        break
      default:
        throw new BadRequestException('Blockchain not supported')
    }

    const response = await lastValueFrom(
      this.httpService.get(baseUrl + `&address=${contractAddress}`).pipe(map((response) => response.data)),
    )

    if (response?.status === '1' && response?.message === 'OK') {
      return JSON.parse(response.result)
    }

    throw new BadRequestException('Unable to retrieve ABI from contract', response.message)
  }

  async getTotalSupply(etherContract: ethers.Contract): Promise<string | null> {
    const totalSupplyWei = await etherContract.totalSupply()
    const decimals = await etherContract.decimals()

    const totalSupplyFormatted = ethers.formatUnits(totalSupplyWei, decimals)

    if (totalSupplyFormatted !== undefined && totalSupplyFormatted !== null) {
      return totalSupplyFormatted
    }

    throw new BadRequestException('Unable to retrieve total supply')
  }

  createTokenBlochainEntity(contract: string, blockchain: Blockchain, tokenInfo: TokenInfos): TokenBlockchain {
    return this.tokenBlockchainRepository.create({
      contract: contract,
      blockchain: blockchain,
      tokenInfo: tokenInfo,
    })
  }

  findAll() {
    return this.tokenInfosRepository.find({ relations: ['tokenBlockchains'] })
  }

  findOne(id: number): Promise<TokenInfos> {
    return this.tokenInfosRepository.findOne({ where: { id: id }, relations: ['tokenBlockchains'] })
  }

  async update(id: number, updateTokenInfoDto: UpdateTokenInfoDto) {
    const tokenInfo = await this.tokenInfosRepository.findOne({ where: { id: id } })

    if (!tokenInfo) {
      throw new NotFoundException(`TokenInfo with ID ${id} not found`)
    }

    Object.assign(tokenInfo, updateTokenInfoDto)

    return await this.tokenInfosRepository.save(tokenInfo)
  }

  async remove(id: number): Promise<TokenInfos> {
    const tokenInfo = await this.tokenInfosRepository.findOne({ where: { id: id }, relations: ['tokenBlockchains'] })
    if (!tokenInfo) {
      throw new NotFoundException(`TokenInfo with ID ${id} not found`)
    }

    await this.tokenBlockchainRepository.remove(tokenInfo.tokenBlockchains)
    await this.tokenInfosRepository.remove(tokenInfo)

    return tokenInfo
  }
}
