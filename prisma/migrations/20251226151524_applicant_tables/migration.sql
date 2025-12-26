-- CreateEnum
CREATE TYPE "ApplicantProfileStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "ApplicantProfile" (
    "applicantId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "passportNumber" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "maritalStatus" TEXT,
    "profileStatus" "ApplicantProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectionReason" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantProfile_pkey" PRIMARY KEY ("applicantId")
);

-- CreateTable
CREATE TABLE "ApplicantSkill" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "proficiencyLevel" TEXT,
    "yearsOfExperience" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantQualification" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "qualificationType" TEXT NOT NULL,
    "institution" TEXT,
    "country" TEXT,
    "yearCompleted" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantWorkExperience" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "employerName" TEXT,
    "country" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "responsibilities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantWorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantDocument" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "verificationStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_userId_key" ON "ApplicantProfile"("userId");

-- CreateIndex
CREATE INDEX "ApplicantProfile_phone_idx" ON "ApplicantProfile"("phone");

-- CreateIndex
CREATE INDEX "ApplicantProfile_email_idx" ON "ApplicantProfile"("email");

-- CreateIndex
CREATE INDEX "ApplicantProfile_profileStatus_idx" ON "ApplicantProfile"("profileStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_passportNumber_key" ON "ApplicantProfile"("passportNumber");

-- CreateIndex
CREATE INDEX "ApplicantSkill_applicantId_idx" ON "ApplicantSkill"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantSkill_applicantId_skillName_key" ON "ApplicantSkill"("applicantId", "skillName");

-- CreateIndex
CREATE INDEX "ApplicantQualification_applicantId_idx" ON "ApplicantQualification"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantWorkExperience_applicantId_idx" ON "ApplicantWorkExperience"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantDocument_applicantId_idx" ON "ApplicantDocument"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantDocument_documentType_idx" ON "ApplicantDocument"("documentType");

-- AddForeignKey
ALTER TABLE "ApplicantProfile" ADD CONSTRAINT "ApplicantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantSkill" ADD CONSTRAINT "ApplicantSkill_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantQualification" ADD CONSTRAINT "ApplicantQualification_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantWorkExperience" ADD CONSTRAINT "ApplicantWorkExperience_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantDocument" ADD CONSTRAINT "ApplicantDocument_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;
