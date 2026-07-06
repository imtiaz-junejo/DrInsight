import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTrustedPartnerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  companyName!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'websiteUrl must be a valid URL with protocol' })
  @MaxLength(500)
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  logoUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTrustedPartnerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  companyName?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'websiteUrl must be a valid URL with protocol' })
  @MaxLength(500)
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  logoUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderTrustedPartnerItemDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;
}

export class ReorderTrustedPartnersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderTrustedPartnerItemDto)
  items!: ReorderTrustedPartnerItemDto[];
}

export class UpdatePartnerStatusDto {
  @IsBoolean()
  isActive!: boolean;
}
