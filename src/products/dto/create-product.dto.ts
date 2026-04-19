import { IsString, IsNumber, IsOptional, IsNotEmpty, IsPositive, Min, IsIn } from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() reference: string;
  @IsString() @IsNotEmpty() nom: string;
  @IsString() @IsNotEmpty() marque: string;
  @IsString() @IsNotEmpty() categorie: string;
  @IsNumber() @IsPositive() prix_achat: number;
  @IsNumber() @IsPositive() prix_vente: number;
  @IsOptional() @IsNumber() @IsPositive() cost_price?: number;
  @IsOptional() @IsNumber() @IsPositive() retail_price?: number;
  @IsOptional() @IsNumber() @Min(0) wholesale_price?: number;
  @IsOptional() @IsNumber() @Min(0) retail_discount_pct?: number;
  @IsOptional() @IsNumber() @Min(0) wholesale_discount_pct?: number;
  @IsOptional() @IsString() unite?: string;
  @IsOptional() @IsNumber() @Min(0) stock?: number;
  @IsOptional() @IsNumber() @Min(0) stock_min?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image_url?: string;
  @IsOptional() @IsIn(['PUBLIC', 'PRO', 'BOTH']) audience?: string;
}
