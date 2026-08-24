import { Body, Controller, Get, NotFoundException, Param, Patch } from "@nestjs/common";
import { IsOptional, IsString, MinLength } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";

class UpdatePartyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

@Controller("parties")
export class PartiesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.party.findMany({ orderBy: { key: "asc" } });
  }

  @Patch(":key")
  async update(@Param("key") key: string, @Body() dto: UpdatePartyDto) {
    const party = await this.prisma.party.findUnique({ where: { key } });
    if (!party) throw new NotFoundException("Party not found");
    return this.prisma.party.update({ where: { key }, data: dto });
  }
}
