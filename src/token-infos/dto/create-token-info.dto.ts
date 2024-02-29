import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateTokenInfoDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0x123456789abcdce325ddbe47a25d4ec3d2311933',
    description: 'The contract address of the token',
  })
  contractAddress: string
}
