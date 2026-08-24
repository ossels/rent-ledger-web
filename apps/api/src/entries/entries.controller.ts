import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Matches } from "class-validator";
import { EntriesService } from "./entries.service";
import { CreateEntryDto, ListEntriesQuery, UpdateEntryDto } from "./entries.dto";

class PrefillDto {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: "month must look like 2026-08" })
  month: string;
}

@Controller("entries")
export class EntriesController {
  constructor(private entries: EntriesService) {}

  @Get()
  findAll(@Query() query: ListEntriesQuery) {
    return this.entries.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateEntryDto) {
    return this.entries.create(dto);
  }

  @Post("prefill")
  prefill(@Body() dto: PrefillDto) {
    return this.entries.prefillMonth(dto.month);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateEntryDto) {
    return this.entries.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.entries.remove(id);
  }
}
