import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";
import { EntryKind, EntryStatus } from "@prisma/client";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export class CreateEntryDto {
  @IsString()
  buildingId: string;

  @IsEnum(EntryKind)
  kind: EntryKind;

  @Matches(MONTH_PATTERN, { message: "month must look like 2026-08" })
  month: string;

  @IsInt()
  @Min(1)
  @Max(31)
  day: number;

  @IsInt()
  @Min(0)
  total: number;

  @IsInt()
  @Min(0)
  splitA: number;

  @IsInt()
  @Min(0)
  splitB: number;

  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateEntryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  day?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  total?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  splitA?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  splitB?: number;

  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ListEntriesQuery {
  @IsOptional()
  @Matches(MONTH_PATTERN, { message: "month must look like 2026-08" })
  month?: string;

  @IsOptional()
  @IsString()
  buildingId?: string;
}
