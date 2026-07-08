import { IsInt, IsEnum, IsString, IsOptional } from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @IsInt()
  itemId: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
