import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatusEnum } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @IsOptional()
  @IsString()
  reason?: string;
}
