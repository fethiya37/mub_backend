-- CreateEnum
CREATE TYPE "ApplicantDraftTokenType" AS ENUM ('DRAFT_ACCESS');

-- CreateTable
CREATE TABLE "ApplicantDraftToken" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "type" "ApplicantDraftTokenType" NOT NULL DEFAULT 'DRAFT_ACCESS',
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicantDraftToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantDraftToken_tokenHash_key" ON "ApplicantDraftToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApplicantDraftToken_applicantId_idx" ON "ApplicantDraftToken"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantDraftToken_expiresAt_idx" ON "ApplicantDraftToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "ApplicantDraftToken" ADD CONSTRAINT "ApplicantDraftToken_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;
