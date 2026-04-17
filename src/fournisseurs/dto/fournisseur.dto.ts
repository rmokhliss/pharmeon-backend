import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateFournisseurDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsOptional() @IsString() contact?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() ville?: string;
}

export class UpdateFournisseurDto extends PartialType(CreateFournisseurDto) {}
