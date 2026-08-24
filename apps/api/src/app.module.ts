import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { BuildingsModule } from "./buildings/buildings.module";
import { EntriesModule } from "./entries/entries.module";
import { LedgerModule } from "./ledger/ledger.module";
import { SettingsModule } from "./settings/settings.module";
import { PartiesModule } from "./parties/parties.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BuildingsModule,
    EntriesModule,
    LedgerModule,
    SettingsModule,
    PartiesModule,
  ],
})
export class AppModule {}
