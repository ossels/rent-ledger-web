import { Module } from "@nestjs/common";
import { LedgerController } from "./ledger.controller";
import { LedgerService } from "./ledger.service";
import { EntriesModule } from "../entries/entries.module";

@Module({
  imports: [EntriesModule],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgerModule {}
