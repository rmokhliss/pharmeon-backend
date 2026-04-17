import { IsString, IsNumber, IsOptional, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() reference: string;
  @IsString() @IsNotEmpty() nom: string;
  @IsString() @IsNotEmpty() marque: string;
  @IsString() @IsNotEmpty() categorie: string;
  @IsNumber() @IsPositive() prix_achat: number;
  @IsNumber() @IsPositive() prix_vente: number;
  @IsOptional() @IsString() unite?: string;
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsNumber() @Min(0) stock_min?: number;
  @IsOptional() @IsString() description?: string;
}
