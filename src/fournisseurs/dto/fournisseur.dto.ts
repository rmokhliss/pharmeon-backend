import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateFournisseurDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsOptional() @IsString() contact?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() code_postal?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsString() ice?: string;
  @IsOptional() @IsString() patente?: string;
  @IsOptional() @IsString() rc?: string;
  @IsOptional() @IsString() site_web?: string;
}

export class UpdateFournisseurDto extends PartialType(CreateFournisseurDto) {}
