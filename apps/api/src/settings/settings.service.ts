import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateSettingsDto } from "./settings.dto";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async get() {
    return (
      (await this.prisma.settings.findUnique({ where: { id: 1 } })) ??
      this.prisma.settings.create({ data: { id: 1 } })
    );
  }

  async update(dto: UpdateSettingsDto) {
    await this.get();
    return this.prisma.settings.update({ where: { id: 1 }, data: dto });
  }
}
