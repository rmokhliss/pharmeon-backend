import { IsNumber, IsOptional, IsPositive, IsString, Min, IsIn } from 'class-validator';

export class UpdateProductDto {
  @IsOptional() @IsString() nom?: string;
  @IsOptional() @IsString() marque?: string;
  @IsOptional() @IsString() categorie?: string;
  @IsOptional() @IsNumber() @IsPositive() prix_achat?: number;
  @IsOptional() @IsNumber() @IsPositive() prix_vente?: number;
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
