import { PartialType } from '@nestjs/mapped-types';
import { CreateCabinDto } from './create-cabin.dto';

export class UpdateCabinDto extends PartialType(CreateCabinDto) {}
