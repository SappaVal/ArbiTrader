import { PartialType } from '@nestjs/mapped-types';
import { CreateTokenInfoDto } from './create-token-info.dto';

export class UpdateTokenInfoDto extends PartialType(CreateTokenInfoDto) {}
