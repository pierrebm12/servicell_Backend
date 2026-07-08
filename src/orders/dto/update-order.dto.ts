import { IsString, IsOptional, IsNumber, IsInt, IsDateString } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsInt()
  clientId?: number;

  @IsOptional()
  @IsInt()
  equipmentId?: number;

  @IsOptional()
  @IsString()
  reportedFault?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  physicalState?: string;

  @IsOptional()
  @IsString()
  devicePassword?: string;

  @IsOptional()
  @IsString()
  devicePattern?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  finalCost?: number;

  @IsOptional()
  @IsNumber()
  downPayment?: number;

  @IsOptional()
  @IsDateString()
  estimatedDate?: string;

  @IsOptional()
  @IsInt()
  assignedToId?: number;
}
