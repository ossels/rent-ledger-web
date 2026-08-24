import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { LedgerService } from "./ledger.service";

@Controller("ledger")
export class LedgerController {
  constructor(private ledger: LedgerService) {}

  @Get("months")
  months() {
    return this.ledger.months();
  }

  @Get("months/:key")
  month(@Param("key") key: string) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) {
      throw new BadRequestException("month must look like 2026-08");
    }
    return this.ledger.month(key);
  }
}
