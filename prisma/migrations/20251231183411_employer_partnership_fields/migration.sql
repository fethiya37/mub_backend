/*
  Warnings:

  - A unique constraint covering the columns `[licenseNumber]` on the table `Employer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `licenseFileUrl` to the `Employer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseNumber` to the `Employer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerIdNumber` to the `Employer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerName` to the `Employer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employer" ADD COLUMN     "licenseExpiry" TIMESTAMP(3),
ADD COLUMN     "licenseFileUrl" TEXT NOT NULL,
ADD COLUMN     "licenseNumber" TEXT NOT NULL,
ADD COLUMN     "ownerIdNumber" TEXT NOT NULL,
ADD COLUMN     "ownerName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Employer_licenseNumber_key" ON "Employer"("licenseNumber");

-- CreateIndex
CREATE INDEX "Employer_licenseNumber_idx" ON "Employer"("licenseNumber");

-- CreateIndex
CREATE INDEX "Employer_ownerIdNumber_idx" ON "Employer"("ownerIdNumber");
