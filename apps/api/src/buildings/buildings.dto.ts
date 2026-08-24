import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";
import { OwnerKind } from "@prisma/client";

export class CreateBuildingDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  tenant?: string;

  @IsInt()
  @Min(0)
  rent: number;

  @IsInt()
  @Min(0)
  splitA: number;

  @IsInt()
  @Min(0)
  splitB: number;

  @IsEnum(OwnerKind)
  owner: OwnerKind;
}

export class UpdateBuildingDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  area?: string;

  @IsOptional()
  @IsString()
  tenant?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  rent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  splitA?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  splitB?: number;

  @IsOptional()
  @IsEnum(OwnerKind)
  owner?: OwnerKind;

  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}
