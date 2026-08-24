import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBuildingDto, UpdateBuildingDto } from "./buildings.dto";

@Injectable()
export class BuildingsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.building.findMany({
      where: { archived: false },
      orderBy: { createdAt: "asc" },
    });
  }

  async findOne(id: string) {
    const building = await this.prisma.building.findUnique({ where: { id } });
    if (!building) throw new NotFoundException("Building not found");
    return building;
  }

  create(dto: CreateBuildingDto) {
    this.assertSplit(dto.rent, dto.splitA, dto.splitB);
    return this.prisma.building.create({ data: dto });
  }

  async update(id: string, dto: UpdateBuildingDto) {
    const existing = await this.findOne(id);
    const rent = dto.rent ?? existing.rent;
    const splitA = dto.splitA ?? existing.splitA;
    const splitB = dto.splitB ?? existing.splitB;
    this.assertSplit(rent, splitA, splitB);
    return this.prisma.building.update({ where: { id }, data: dto });
  }

  private assertSplit(rent: number, splitA: number, splitB: number) {
    if (splitA + splitB !== rent) {
      throw new BadRequestException("splitA + splitB must equal rent");
    }
  }
}
