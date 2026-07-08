import { IsInt, IsString, IsEnum, IsOptional } from 'class-validator';
import { SignatureType } from '@prisma/client';

export class CreateSignatureDto {
  @IsInt()
  orderId: number;

  @IsString()
  url: string;

  @IsOptional()
  @IsEnum(SignatureType)
  type?: SignatureType;
}
