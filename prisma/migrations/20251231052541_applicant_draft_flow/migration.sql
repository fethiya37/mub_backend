/*
  Warnings:

  - You are about to drop the column `revokedAt` on the `ApplicantDraftToken` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `ApplicantDraftToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[applicantId,documentType]` on the table `ApplicantDocument` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `ApplicantProfile` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `documentType` on the `ApplicantDocument` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ApplicantDocumentType" AS ENUM ('PASSPORT', 'PERSONAL_PHOTO', 'COC_CERTIFICATE', 'LABOR_ID', 'OTHER');

-- DropIndex
DROP INDEX "ApplicantProfile_passportNumber_key";

-- DropIndex
DROP INDEX "ApplicantProfile_phone_idx";

-- AlterTable
ALTER TABLE "ApplicantDocument" DROP COLUMN "documentType",
ADD COLUMN     "documentType" "ApplicantDocumentType" NOT NULL;

-- AlterTable
ALTER TABLE "ApplicantDraftToken" DROP COLUMN "revokedAt",
DROP COLUMN "type",
ADD COLUMN     "usedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ApplicantProfile" ADD COLUMN     "applicationNumber" TEXT,
ADD COLUMN     "barcodeValue" TEXT,
ADD COLUMN     "laborId" TEXT,
ADD COLUMN     "passportExpiry" TIMESTAMP(3),
ADD COLUMN     "region" TEXT,
ADD COLUMN     "visaNumber" TEXT;

-- DropEnum
DROP TYPE "ApplicantDraftTokenType";

-- CreateIndex
CREATE INDEX "ApplicantDocument_documentType_idx" ON "ApplicantDocument"("documentType");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantDocument_applicantId_documentType_key" ON "ApplicantDocument"("applicantId", "documentType");

-- CreateIndex
CREATE INDEX "ApplicantProfile_passportNumber_idx" ON "ApplicantProfile"("passportNumber");

-- CreateIndex
CREATE INDEX "ApplicantProfile_laborId_idx" ON "ApplicantProfile"("laborId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_phone_key" ON "ApplicantProfile"("phone");
