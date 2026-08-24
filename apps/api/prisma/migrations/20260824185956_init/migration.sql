-- CreateEnum
CREATE TYPE "OwnerKind" AS ENUM ('A', 'B', 'SHARED');

-- CreateEnum
CREATE TYPE "EntryKind" AS ENUM ('RENT', 'EXPENSE');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('COLLECTED', 'AWAITED', 'PAID');

-- CreateTable
CREATE TABLE "parties" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "area" TEXT,
    "tenant" TEXT,
    "rent" INTEGER NOT NULL,
    "splitA" INTEGER NOT NULL,
    "splitB" INTEGER NOT NULL,
    "owner" "OwnerKind" NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "kind" "EntryKind" NOT NULL,
    "month" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "splitA" INTEGER NOT NULL,
    "splitB" INTEGER NOT NULL,
    "status" "EntryStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "currencyCode" TEXT NOT NULL DEFAULT 'INR',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "autoCarry" BOOLEAN NOT NULL DEFAULT true,
    "reminder" BOOLEAN NOT NULL DEFAULT true,
    "confirmClose" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parties_key_key" ON "parties"("key");

-- CreateIndex
CREATE INDEX "entries_month_idx" ON "entries"("month");

-- CreateIndex
CREATE INDEX "entries_buildingId_month_idx" ON "entries"("buildingId", "month");

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
