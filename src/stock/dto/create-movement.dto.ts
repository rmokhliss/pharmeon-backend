import { IsString, IsInt, IsPositive, IsOptional, IsIn } from 'class-validator';

export class CreateMovementDto {
  @IsIn(['ENTREE', 'SORTIE']) type: string;
  @IsInt() @IsPositive() quantite: number;
  @IsInt() @IsPositive() productId: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsInt() clientId?: number;
  @IsOptional() @IsInt() fournisseurId?: number;
}
