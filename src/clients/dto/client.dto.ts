import { IsString, IsNotEmpty, IsOptional, IsIn, IsEmail } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateClientDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsIn(['PHARMACIE', 'PARA', 'PARTICULIER']) type: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsEmail() email?: string;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}

export class RegisterClientDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsIn(['PHARMACIE', 'PARA', 'PARTICULIER']) type: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() ville?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsString() password?: string;
}
