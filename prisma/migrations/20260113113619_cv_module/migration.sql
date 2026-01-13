/*
  Warnings:

  - Changed the type of `status` on the `CvAdminReview` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CvAdminReviewStatus" AS ENUM ('approved', 'rejected');

-- AlterTable
ALTER TABLE "CvAdminReview" DROP COLUMN "status",
ADD COLUMN     "status" "CvAdminReviewStatus" NOT NULL;
