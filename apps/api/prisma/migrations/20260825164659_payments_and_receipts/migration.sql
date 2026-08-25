-- AlterEnum
ALTER TYPE "EntryStatus" ADD VALUE 'PARTIAL';

-- AlterTable
ALTER TABLE "entries" ADD COLUMN     "receiptPath" TEXT,
ADD COLUMN     "received" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_entryId_idx" ON "payments"("entryId");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: settled entries are fully received
UPDATE "entries" SET "received" = "total" WHERE "status" IN ('COLLECTED', 'PAID');

-- Backfill: one synthesized full payment per already-collected rent entry,
-- dated the entry's own ledger date, so payment history reads sensibly.
INSERT INTO "payments" ("id", "entryId", "amount", "date", "note")
SELECT gen_random_uuid()::text, "id", "total", "month" || '-' || lpad("day"::text, 2, '0'), NULL
FROM "entries"
WHERE "kind" = 'RENT' AND "status" = 'COLLECTED';
