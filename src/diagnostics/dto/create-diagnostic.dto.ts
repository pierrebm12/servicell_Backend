import { IsString, IsOptional, IsNumber, IsBoolean, IsInt } from 'class-validator';

export class CreateDiagnosticDto {
  @IsInt()
  orderId: number;

  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsString()
  neededParts?: string;

  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}
