-- CreateEnum
CREATE TYPE "ApplicantCvStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "VisaApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED', 'EMBASSY_PROCESSING', 'APPROVED', 'REJECTED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "VisaDocumentType" AS ENUM ('PASSPORT', 'MEDICAL_CLEARANCE', 'POLICE_CLEARANCE', 'EMPLOYMENT_CONTRACT', 'INVITATION_LETTER', 'EMBASSY_FORMS', 'OTHER');

-- CreateEnum
CREATE TYPE "VisaDocumentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VisaComplianceRequirementStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VisaNotificationType" AS ENUM ('EXPIRY_ALERT', 'STATUS_UPDATE', 'DOCUMENT_REQUEST', 'DECISION_RECORDED');

-- CreateTable
CREATE TABLE "CvTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "htmlTemplate" TEXT NOT NULL,
    "cssStyle" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantCv" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "jobId" TEXT,
    "cvTemplateId" TEXT NOT NULL,
    "status" "ApplicantCvStatus" NOT NULL DEFAULT 'draft',
    "currentVersion" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantCv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantCvVersion" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "htmlSnapshot" TEXT NOT NULL,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicantCvVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantCvSection" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "sectionName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,
    "customContent" JSONB,

    CONSTRAINT "ApplicantCvSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvAdminReview" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comments" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CvAdminReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvAuditLog" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT,
    "meta" JSONB,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CvAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaApplication" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "employerId" TEXT,
    "jobId" TEXT,
    "visaType" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "applicationReference" TEXT,
    "status" "VisaApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "assignedCaseOfficerId" TEXT,
    "submittedByAdminId" TEXT,
    "submissionDate" TIMESTAMP(3),
    "decisionDate" TIMESTAMP(3),
    "visaIssueDate" TIMESTAMP(3),
    "visaExpiryDate" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaStatusHistory" (
    "id" TEXT NOT NULL,
    "visaApplicationId" TEXT NOT NULL,
    "previousStatus" "VisaApplicationStatus",
    "newStatus" "VisaApplicationStatus" NOT NULL,
    "changedByAdminId" TEXT,
    "changeReason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisaStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaDocument" (
    "id" TEXT NOT NULL,
    "visaApplicationId" TEXT NOT NULL,
    "documentType" "VisaDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileHash" TEXT,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verificationStatus" "VisaDocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationReason" TEXT,
    "verifiedByAdminId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "uploadedByAdminId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaComplianceCheck" (
    "id" TEXT NOT NULL,
    "visaApplicationId" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "requirementStatus" "VisaComplianceRequirementStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "checkedByAdminId" TEXT,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaComplianceCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaNotification" (
    "id" TEXT NOT NULL,
    "visaApplicationId" TEXT NOT NULL,
    "adminUserId" TEXT,
    "notificationType" "VisaNotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisaNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CvTemplate_isActive_idx" ON "CvTemplate"("isActive");

-- CreateIndex
CREATE INDEX "CvTemplate_createdAt_idx" ON "CvTemplate"("createdAt");

-- CreateIndex
CREATE INDEX "ApplicantCv_applicantId_idx" ON "ApplicantCv"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantCv_jobId_idx" ON "ApplicantCv"("jobId");

-- CreateIndex
CREATE INDEX "ApplicantCv_status_idx" ON "ApplicantCv"("status");

-- CreateIndex
CREATE INDEX "ApplicantCv_createdAt_idx" ON "ApplicantCv"("createdAt");

-- CreateIndex
CREATE INDEX "ApplicantCvVersion_cvId_idx" ON "ApplicantCvVersion"("cvId");

-- CreateIndex
CREATE INDEX "ApplicantCvVersion_createdAt_idx" ON "ApplicantCvVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantCvVersion_cvId_versionNumber_key" ON "ApplicantCvVersion"("cvId", "versionNumber");

-- CreateIndex
CREATE INDEX "ApplicantCvSection_cvId_idx" ON "ApplicantCvSection"("cvId");

-- CreateIndex
CREATE INDEX "ApplicantCvSection_displayOrder_idx" ON "ApplicantCvSection"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantCvSection_cvId_sectionName_key" ON "ApplicantCvSection"("cvId", "sectionName");

-- CreateIndex
CREATE INDEX "CvAdminReview_cvId_idx" ON "CvAdminReview"("cvId");

-- CreateIndex
CREATE INDEX "CvAdminReview_reviewedAt_idx" ON "CvAdminReview"("reviewedAt");

-- CreateIndex
CREATE INDEX "CvAuditLog_cvId_idx" ON "CvAuditLog"("cvId");

-- CreateIndex
CREATE INDEX "CvAuditLog_performedAt_idx" ON "CvAuditLog"("performedAt");

-- CreateIndex
CREATE INDEX "VisaApplication_applicantId_idx" ON "VisaApplication"("applicantId");

-- CreateIndex
CREATE INDEX "VisaApplication_employerId_idx" ON "VisaApplication"("employerId");

-- CreateIndex
CREATE INDEX "VisaApplication_jobId_idx" ON "VisaApplication"("jobId");

-- CreateIndex
CREATE INDEX "VisaApplication_status_idx" ON "VisaApplication"("status");

-- CreateIndex
CREATE INDEX "VisaApplication_destinationCountry_idx" ON "VisaApplication"("destinationCountry");

-- CreateIndex
CREATE INDEX "VisaApplication_assignedCaseOfficerId_idx" ON "VisaApplication"("assignedCaseOfficerId");

-- CreateIndex
CREATE INDEX "VisaStatusHistory_visaApplicationId_idx" ON "VisaStatusHistory"("visaApplicationId");

-- CreateIndex
CREATE INDEX "VisaStatusHistory_changedAt_idx" ON "VisaStatusHistory"("changedAt");

-- CreateIndex
CREATE INDEX "VisaStatusHistory_newStatus_idx" ON "VisaStatusHistory"("newStatus");

-- CreateIndex
CREATE INDEX "VisaDocument_visaApplicationId_idx" ON "VisaDocument"("visaApplicationId");

-- CreateIndex
CREATE INDEX "VisaDocument_documentType_idx" ON "VisaDocument"("documentType");

-- CreateIndex
CREATE INDEX "VisaDocument_isActive_idx" ON "VisaDocument"("isActive");

-- CreateIndex
CREATE INDEX "VisaDocument_verificationStatus_idx" ON "VisaDocument"("verificationStatus");

-- CreateIndex
CREATE INDEX "VisaComplianceCheck_visaApplicationId_idx" ON "VisaComplianceCheck"("visaApplicationId");

-- CreateIndex
CREATE INDEX "VisaComplianceCheck_requirementStatus_idx" ON "VisaComplianceCheck"("requirementStatus");

-- CreateIndex
CREATE INDEX "VisaComplianceCheck_checkedAt_idx" ON "VisaComplianceCheck"("checkedAt");

-- CreateIndex
CREATE INDEX "VisaNotification_visaApplicationId_idx" ON "VisaNotification"("visaApplicationId");

-- CreateIndex
CREATE INDEX "VisaNotification_adminUserId_idx" ON "VisaNotification"("adminUserId");

-- CreateIndex
CREATE INDEX "VisaNotification_notificationType_idx" ON "VisaNotification"("notificationType");

-- CreateIndex
CREATE INDEX "VisaNotification_createdAt_idx" ON "VisaNotification"("createdAt");

-- AddForeignKey
ALTER TABLE "ApplicantCv" ADD CONSTRAINT "ApplicantCv_cvTemplateId_fkey" FOREIGN KEY ("cvTemplateId") REFERENCES "CvTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantCv" ADD CONSTRAINT "ApplicantCv_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantCv" ADD CONSTRAINT "ApplicantCv_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantCvVersion" ADD CONSTRAINT "ApplicantCvVersion_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "ApplicantCv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantCvSection" ADD CONSTRAINT "ApplicantCvSection_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "ApplicantCv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvAdminReview" ADD CONSTRAINT "CvAdminReview_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "ApplicantCv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvAdminReview" ADD CONSTRAINT "CvAdminReview_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvAuditLog" ADD CONSTRAINT "CvAuditLog_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "ApplicantCv"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_assignedCaseOfficerId_fkey" FOREIGN KEY ("assignedCaseOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaApplication" ADD CONSTRAINT "VisaApplication_submittedByAdminId_fkey" FOREIGN KEY ("submittedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaStatusHistory" ADD CONSTRAINT "VisaStatusHistory_visaApplicationId_fkey" FOREIGN KEY ("visaApplicationId") REFERENCES "VisaApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaStatusHistory" ADD CONSTRAINT "VisaStatusHistory_changedByAdminId_fkey" FOREIGN KEY ("changedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaDocument" ADD CONSTRAINT "VisaDocument_visaApplicationId_fkey" FOREIGN KEY ("visaApplicationId") REFERENCES "VisaApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaDocument" ADD CONSTRAINT "VisaDocument_verifiedByAdminId_fkey" FOREIGN KEY ("verifiedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaDocument" ADD CONSTRAINT "VisaDocument_uploadedByAdminId_fkey" FOREIGN KEY ("uploadedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaComplianceCheck" ADD CONSTRAINT "VisaComplianceCheck_visaApplicationId_fkey" FOREIGN KEY ("visaApplicationId") REFERENCES "VisaApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaComplianceCheck" ADD CONSTRAINT "VisaComplianceCheck_checkedByAdminId_fkey" FOREIGN KEY ("checkedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaNotification" ADD CONSTRAINT "VisaNotification_visaApplicationId_fkey" FOREIGN KEY ("visaApplicationId") REFERENCES "VisaApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaNotification" ADD CONSTRAINT "VisaNotification_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
