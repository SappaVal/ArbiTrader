import {
  BadRequestException,
  Body,
  ConflictException,
  NotFoundException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { TokenInfos } from 'src/entities/token.entity'
import { CreateTokenInfoDto } from './dto/create-token-info.dto'
import { UpdateTokenInfoDto } from './dto/update-token-info.dto'
import { TokenInfosService } from './token-infos.service'

@ApiTags('Tokens')
@Controller('tokens')
export class TokenInfosController {
  constructor(private readonly tokenInfosService: TokenInfosService) {}

  @Post('erc20')
  @ApiOperation({ summary: 'Add an ERC-20 token', description: 'Add an ERC-20 token to the database' })
  @ApiResponse({ status: 201, type: TokenInfos, description: 'Successfully created ERC-20 token' })
  @ApiBadRequestResponse({ description: 'Invalid contract' })
  @ApiConflictResponse({ description: 'Token with the same details already exists in the blockchain' })
  @ApiBody({ type: CreateTokenInfoDto })
  async addEthToken(@Body() createTokenInfoDto: CreateTokenInfoDto): Promise<TokenInfos> {
    try {
      return await this.tokenInfosService.createStandardToken(createTokenInfoDto, 'ETH')
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error
      }

      throw new BadRequestException('Unexpected error')
    }
  }

  @Post('brc20')
  @ApiOperation({ summary: 'Add an BRC-20 token', description: 'Add a BRC-20 token to the database' })
  @ApiResponse({ status: 201, type: TokenInfos, description: 'Successfully created BRC-20 token' })
  @ApiBadRequestResponse({ description: 'Unexpected error' })
  @ApiConflictResponse({ description: 'Token with the same details already exists in the blockchain' })
  @ApiBody({ type: CreateTokenInfoDto, description: 'The contract address of the token' })
  async addBscToken(@Body() createTokenInfoDto: CreateTokenInfoDto): Promise<TokenInfos> {
    try {
      return await this.tokenInfosService.createStandardToken(createTokenInfoDto, 'BSC')
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error
      }
      throw new BadRequestException('Unexpected error')
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get All Tokens', description: 'Retrieve all tokens' })
  @ApiResponse({ status: 200, type: [TokenInfos], description: 'Successfully retrieved all tokens' })
  @ApiBadRequestResponse({ description: 'Unexpected error' })
  async findAll(): Promise<TokenInfos[]> {
    try {
      return await this.tokenInfosService.findAll()
    } catch (error) {
      throw new BadRequestException('Unexpected error')
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Token Information', description: 'Retrieve token details by providing the token ID' })
  @ApiParam({ name: 'id', description: 'ID of the token to retrieve', type: Number })
  @ApiResponse({ status: 200, type: TokenInfos, description: 'Successfully retrieved token information' })
  @ApiNotFoundResponse({ description: 'Token not found' })
  @ApiBadRequestResponse({ description: 'Unexpected error' })
  async findOne(@Param('id') id: string): Promise<TokenInfos> {
    try {
      const tokenInfo = await this.tokenInfosService.findOne(+id)

      if (!tokenInfo) {
        throw new NotFoundException('Token not found')
      }

      return tokenInfo
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException('Unexpected error')
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Token Information', description: 'Update token details by providing the token ID' })
  @ApiParam({ name: 'id', description: 'ID of the token to update', type: Number })
  @ApiResponse({ status: 200, type: TokenInfos, description: 'Successfully updated token information' })
  @ApiNotFoundResponse({ description: 'Token not found' })
  @ApiBadRequestResponse({ description: 'Unexpected error' })
  async update(@Param('id') id: string, @Body() updateTokenInfoDto: UpdateTokenInfoDto): Promise<TokenInfos> {
    try {
      return await this.tokenInfosService.update(+id, updateTokenInfoDto)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException('Unexpected error')
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Token', description: 'Remove a token and its associated blockchain information' })
  @ApiParam({ name: 'id', description: 'ID of the token to delete', type: Number })
  @ApiResponse({
    status: 200,
    type: TokenInfos,
    description: 'Successfully deleted token and associated blockchain information',
  })
  @ApiNotFoundResponse({ description: 'Token not found' })
  async remove(@Param('id') id: string): Promise<TokenInfos> {
    try {
      return await this.tokenInfosService.remove(+id)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException('Unexpected error')
    }
  }
}
