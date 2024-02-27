import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTokenInfoDto {
  @IsNotEmpty()
  @IsString()
  contractAddress: string;

  @IsNotEmpty()
  @IsString()
  blockchainSymbol: string;
}
