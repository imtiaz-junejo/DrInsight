import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FounderCredentialDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  icon!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  text!: string;
}

export class UpsertFounderMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  founderName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  designation!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  headline!: string;

  @IsString()
  @IsNotEmpty()
  messageHtml!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  signatureImageUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'videoUrl must be a valid URL with protocol' })
  @MaxLength(500)
  videoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  eyebrow?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  badgeText?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FounderCredentialDto)
  credentials?: FounderCredentialDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  signatureName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  signatureTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  locationLine?: string;
}
