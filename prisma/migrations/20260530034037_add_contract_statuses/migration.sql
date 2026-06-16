/*
  Warnings:

  - A unique constraint covering the columns `[iqamaNumber]` on the table `Sponsor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employerId,iqamaNumber]` on the table `Sponsor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employerId` to the `Sponsor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iqamaNumber` to the `Sponsor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ISSUED', 'SIGNED', 'COMPLETED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VisaCaseStatus" ADD VALUE 'CONTRACT_ISSUED';
ALTER TYPE "VisaCaseStatus" ADD VALUE 'CONTRACT_SIGNED';

-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "employerId" TEXT NOT NULL,
ADD COLUMN     "iqamaNumber" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "contractNumber" TEXT NOT NULL,
    "contractFileUrl" TEXT NOT NULL,
    "signedFileUrl" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "contractPeriodYears" INTEGER,
    "monthlySalary" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'SAR',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contract_visaCaseId_key" ON "Contract"("visaCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_contractNumber_key" ON "Contract"("contractNumber");

-- CreateIndex
CREATE INDEX "Contract_visaCaseId_idx" ON "Contract"("visaCaseId");

-- CreateIndex
CREATE INDEX "Contract_contractNumber_idx" ON "Contract"("contractNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_iqamaNumber_key" ON "Sponsor"("iqamaNumber");

-- CreateIndex
CREATE INDEX "Sponsor_employerId_idx" ON "Sponsor"("employerId");

-- CreateIndex
CREATE INDEX "Sponsor_iqamaNumber_idx" ON "Sponsor"("iqamaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_employerId_iqamaNumber_key" ON "Sponsor"("employerId", "iqamaNumber");

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
