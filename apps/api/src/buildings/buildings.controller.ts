import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { BuildingsService } from "./buildings.service";
import { CreateBuildingDto, UpdateBuildingDto } from "./buildings.dto";

@Controller("buildings")
export class BuildingsController {
  constructor(private buildings: BuildingsService) {}

  @Get()
  findAll() {
    return this.buildings.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.buildings.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBuildingDto) {
    return this.buildings.create(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateBuildingDto) {
    return this.buildings.update(id, dto);
  }
}
