import { IsString, IsOptional, IsNumber, IsInt, IsDateString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class ChecklistItemDto {
  @IsString()
  componentName: string;

  @IsBoolean()
  checked: boolean;

  @IsOptional()
  @IsBoolean()
  notTestable?: boolean;
}

class OrderPartDto {
  @IsString()
  partName: string;

  @IsNumber()
  cost: number;
}

export class CreateOrderDto {
  @IsInt()
  clientId: number;

  @IsInt()
  equipmentId: number;

  @IsString()
  reportedFault: string;

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
  @IsString()
  lockCode?: string;

  @IsOptional()
  @IsString()
  lockCodeType?: string;

  @IsOptional()
  @IsNumber()
  laborCost?: number;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  downPayment?: number;

  @IsOptional()
  @IsDateString()
  estimatedDate?: string;

  @IsOptional()
  @IsInt()
  assignedToId?: number;

  @IsOptional()
  @IsInt()
  deviceTypeId?: number;

  @IsOptional()
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsInt()
  modelId?: number;

  @IsOptional()
  @IsInt()
  serviceTypeId?: number;

  @IsOptional()
  @IsString()
  clientPhotoUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderPartDto)
  parts?: OrderPartDto[];

  @IsOptional()
  @IsString()
  repairNotes?: string;
}
