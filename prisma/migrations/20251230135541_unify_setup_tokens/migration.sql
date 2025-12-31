/*
  Warnings:

  - You are about to drop the `PartnerPasswordToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PasswordTokenType" AS ENUM ('RESET_PASSWORD', 'SETUP_PASSWORD');

-- DropForeignKey
ALTER TABLE "PartnerPasswordToken" DROP CONSTRAINT "PartnerPasswordToken_employerId_fkey";

-- AlterTable
ALTER TABLE "PasswordResetToken" ADD COLUMN     "type" "PasswordTokenType" NOT NULL DEFAULT 'RESET_PASSWORD';

-- DropTable
DROP TABLE "PartnerPasswordToken";

-- CreateIndex
CREATE INDEX "PasswordResetToken_type_idx" ON "PasswordResetToken"("type");
