import { PartialType } from '@nestjs/mapped-types';
import { CreateGlobalParamDto } from './create-global-param.dto';

export class UpdateGlobalParamDto extends PartialType(CreateGlobalParamDto) {}
