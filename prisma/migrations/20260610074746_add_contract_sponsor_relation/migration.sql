/*
  Warnings:

  - You are about to drop the column `sponsorId` on the `VisaCase` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FlightBookingStatus" AS ENUM ('PENDING', 'APPROVED', 'BOOKED', 'CANCELLED', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "VisaCase" DROP CONSTRAINT "VisaCase_sponsorId_fkey";

-- DropIndex
DROP INDEX "VisaCase_sponsorId_idx";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "sponsor_id" TEXT;

-- AlterTable
ALTER TABLE "FlightBooking" ADD COLUMN     "status" "FlightBookingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "ticketFileUrl" TEXT,
ADD COLUMN     "ticketNumber" TEXT;

-- AlterTable
ALTER TABLE "VisaCase" DROP COLUMN "sponsorId";

-- CreateIndex
CREATE INDEX "Contract_sponsor_id_idx" ON "Contract"("sponsor_id");

-- CreateIndex
CREATE INDEX "FlightBooking_ticketNumber_idx" ON "FlightBooking"("ticketNumber");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "Sponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
