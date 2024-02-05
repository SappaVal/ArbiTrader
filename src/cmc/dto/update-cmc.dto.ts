import { PartialType } from '@nestjs/mapped-types';
import { CreateCmcDto } from './create-cmc.dto';

export class UpdateCmcDto extends PartialType(CreateCmcDto) {}
