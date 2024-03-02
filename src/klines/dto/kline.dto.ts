import { ApiTags, ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@ApiTags('KlineDto')
export class KlineDto {
  @IsString()
  @ApiProperty({ example: '1632960000000', description: 'The open time of the kline' })
  openTime: number;

  @IsString()
  @ApiProperty({ example: '1632960000000', description: 'The open time of the kline' })
  open: string;

  @IsString()
  @ApiProperty({ example: '1632960000000', description: 'The open time of the kline' })
  high: string;

  @IsString()
  @ApiProperty({ example: '1632960000000', description: 'The open time of the kline' })
  low: string;

  @IsString()
  @ApiProperty({ example: '1632960000000', description: 'The open time of the kline' })
  close: string;

  @IsString()
  @ApiProperty({ example: '1632960000000', description: 'The open time of the kline' })
  volume: string;

  @IsString()
  @ApiProperty({ example: '1632960000000', description: 'The open time of the kline' })
  closeTime: number;

  static fromRawResult(result: any): KlineDto {
    const transformedResult = new KlineDto();
    transformedResult.openTime = result.opentime;
    transformedResult.open = result.open;
    transformedResult.high = result.high;
    transformedResult.low = result.low;
    transformedResult.close = result.close;
    transformedResult.volume = result.volume;
    transformedResult.closeTime = result.closetime;
    return transformedResult;
  }
}
