import { IsInt, IsString, IsEnum, IsOptional } from 'class-validator';
import { PhotoType } from '@prisma/client';

export class CreatePhotographDto {
  @IsInt()
  orderId: number;

  @IsString()
  url: string;

  @IsOptional()
  @IsEnum(PhotoType)
  type?: PhotoType;
}
