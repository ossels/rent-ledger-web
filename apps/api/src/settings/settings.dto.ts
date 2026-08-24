import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsIn(["INR", "USD", "AED", "GBP"])
  currencyCode?: string;

  @IsOptional()
  @IsIn(["en-IN", "en-US"])
  locale?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  autoCarry?: boolean;

  @IsOptional()
  @IsBoolean()
  reminder?: boolean;

  @IsOptional()
  @IsBoolean()
  confirmClose?: boolean;
}
