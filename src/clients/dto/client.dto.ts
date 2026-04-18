import { IsString, IsNotEmpty, IsOptional, IsIn, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateClientDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsIn(['PHARMACIE', 'PARA', 'PARTICULIER']) type: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() code_postal?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() contact_nom?: string;
  @IsOptional() @IsString() ice?: string;
  @IsOptional() @IsString() patente?: string;
  @IsOptional() @IsString() rc?: string;
  @IsOptional() @IsString() site_web?: string;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}

export class RegisterClientDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsIn(['PHARMACIE', 'PARA', 'PARTICULIER']) type: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() code_postal?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() contact_nom?: string;
  @IsOptional() @IsString() ice?: string;
  @IsOptional() @IsString() patente?: string;
  @IsOptional() @IsString() rc?: string;
  @IsOptional() @IsString() site_web?: string;
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsString() password?: string;
}
