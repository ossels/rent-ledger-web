import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    await this.bootstrap();
  }

  // A fresh production database has no seed. Make sure the two owner slots and
  // the settings row always exist; names are edited in Settings.
  private async bootstrap() {
    const parties = await this.party.count();
    if (parties === 0) {
      await this.party.createMany({
        data: [
          { key: "a", name: "You" },
          { key: "b", name: "Partner" },
        ],
      });
    }
    const settings = await this.settings.count();
    if (settings === 0) {
      await this.settings.create({ data: { id: 1 } });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
