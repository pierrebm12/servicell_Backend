import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum SearchType {
  NAME = 'name',
  DOCUMENT = 'document',
  PHONE = 'phone',
}

export class ClientQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType;
}
