import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExchangeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  apiUrl: string;
}
