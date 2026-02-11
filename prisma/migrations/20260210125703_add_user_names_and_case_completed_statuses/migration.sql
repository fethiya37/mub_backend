-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "middleName" TEXT;

-- AlterTable
ALTER TABLE "VisaCase" ADD COLUMN     "completedStatuses" "VisaCaseStatus"[] DEFAULT ARRAY[]::"VisaCaseStatus"[];
