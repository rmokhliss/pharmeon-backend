import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateLivreurDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() vehicule?: string;
  @IsOptional() @IsString() cin?: string;
  @IsOptional() @IsString() note?: string;
}

export class UpdateLivreurDto extends PartialType(CreateLivreurDto) {}
