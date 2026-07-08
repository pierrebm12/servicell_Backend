import { IsString, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateDeviceTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class CreateBrandDto {
  @IsString()
  name: string;
}

export class CreateDeviceModelDto {
  @IsString()
  name: string;

  @IsInt()
  deviceTypeId: number;

  @IsInt()
  brandId: number;
}

export class CreateServiceTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  defaultCost?: number;
}
