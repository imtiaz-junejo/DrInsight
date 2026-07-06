import { IsEmail, IsString, MinLength } from 'class-validator';

export class OAuthExchangeDto {
  @IsString()
  @MinLength(16)
  code: string;
}

export class CompleteOAuthRegistrationDto {
  @IsString()
  @MinLength(16)
  code: string;

  @IsEmail()
  email: string;
}
