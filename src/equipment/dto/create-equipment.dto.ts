import { IsString, IsOptional } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  imei?: string;

  @IsOptional()
  @IsString()
  serial?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  operator?: string;

  @IsOptional()
  @IsString()
  accessories?: string;
}
