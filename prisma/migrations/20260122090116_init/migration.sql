-- CreateEnum
CREATE TYPE "AccountActionTokenType" AS ENUM ('ACCOUNT_SETUP', 'PASSWORD_RESET', 'EMAIL_VERIFY');

-- CreateEnum
CREATE TYPE "LocalAgencyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LocalAgencyApprovalAction" AS ENUM ('APPROVED', 'REJECTED', 'SUSPENDED', 'REACTIVATED');

-- CreateEnum
CREATE TYPE "ApplicantProfileStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApplicantDocumentType" AS ENUM ('PASSPORT', 'PERSONAL_PHOTO', 'COC_CERTIFICATE', 'LABOR_ID', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicantRegistrationSource" AS ENUM ('SELF', 'AGENCY', 'MUB_STAFF');

-- CreateEnum
CREATE TYPE "EmployerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EmployerCreatedBy" AS ENUM ('EMPLOYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "EmployerApprovalAction" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('FULL_TIME', 'PART_TIME', 'TEMPORARY', 'CONTRACT', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicantCvStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "CvAdminReviewStatus" AS ENUM ('approved', 'rejected');

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
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicantVerified" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockUntil" TIMESTAMP(3),
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountActionToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AccountActionTokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountActionToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "performedBy" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalAgency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "status" "LocalAgencyStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "rejectionReason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalAgency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalAgencyApprovalLog" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "action" "LocalAgencyApprovalAction" NOT NULL,
    "reason" TEXT,
    "actionBy" TEXT NOT NULL,
    "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalAgencyApprovalLog_pkey" PRIMARY KEY ("id")
);

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
    "passportExpiry" TIMESTAMP(3),
    "laborId" TEXT,
    "region" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "maritalStatus" TEXT,
    "visaNumber" TEXT,
    "applicationNumber" TEXT,
    "barcodeValue" TEXT,
    "registrationSource" "ApplicantRegistrationSource" NOT NULL DEFAULT 'SELF',
    "createdBy" TEXT,
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
CREATE TABLE "ApplicantDocument" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "documentType" "ApplicantDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "verificationStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantDraftToken" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicantDraftToken_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "address" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerIdNumber" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseFileUrl" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3),
    "status" "EmployerStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" "EmployerCreatedBy" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerApprovalLog" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "action" "EmployerApprovalAction" NOT NULL,
    "reason" TEXT,
    "actionBy" TEXT NOT NULL,
    "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployerApprovalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "salaryRange" TEXT,
    "contractType" "ContractType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

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
    "status" "CvAdminReviewStatus" NOT NULL,
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "RefreshToken"("jti");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccountActionToken_tokenHash_key" ON "AccountActionToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AccountActionToken_userId_idx" ON "AccountActionToken"("userId");

-- CreateIndex
CREATE INDEX "AccountActionToken_type_idx" ON "AccountActionToken"("type");

-- CreateIndex
CREATE INDEX "AccountActionToken_expiresAt_idx" ON "AccountActionToken"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_performedBy_idx" ON "AuditLog"("performedBy");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "LocalAgency_licenseNumber_key" ON "LocalAgency"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LocalAgency_userId_key" ON "LocalAgency"("userId");

-- CreateIndex
CREATE INDEX "LocalAgency_status_idx" ON "LocalAgency"("status");

-- CreateIndex
CREATE INDEX "LocalAgency_licenseNumber_idx" ON "LocalAgency"("licenseNumber");

-- CreateIndex
CREATE INDEX "LocalAgency_phone_idx" ON "LocalAgency"("phone");

-- CreateIndex
CREATE INDEX "LocalAgency_email_idx" ON "LocalAgency"("email");

-- CreateIndex
CREATE INDEX "LocalAgencyApprovalLog_agencyId_idx" ON "LocalAgencyApprovalLog"("agencyId");

-- CreateIndex
CREATE INDEX "LocalAgencyApprovalLog_actionDate_idx" ON "LocalAgencyApprovalLog"("actionDate");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_userId_key" ON "ApplicantProfile"("userId");

-- CreateIndex
CREATE INDEX "ApplicantProfile_email_idx" ON "ApplicantProfile"("email");

-- CreateIndex
CREATE INDEX "ApplicantProfile_passportNumber_idx" ON "ApplicantProfile"("passportNumber");

-- CreateIndex
CREATE INDEX "ApplicantProfile_profileStatus_idx" ON "ApplicantProfile"("profileStatus");

-- CreateIndex
CREATE INDEX "ApplicantProfile_laborId_idx" ON "ApplicantProfile"("laborId");

-- CreateIndex
CREATE INDEX "ApplicantProfile_registrationSource_idx" ON "ApplicantProfile"("registrationSource");

-- CreateIndex
CREATE INDEX "ApplicantProfile_createdBy_idx" ON "ApplicantProfile"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_phone_key" ON "ApplicantProfile"("phone");

-- CreateIndex
CREATE INDEX "ApplicantDocument_applicantId_idx" ON "ApplicantDocument"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantDocument_documentType_idx" ON "ApplicantDocument"("documentType");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantDocument_applicantId_documentType_key" ON "ApplicantDocument"("applicantId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantDraftToken_tokenHash_key" ON "ApplicantDraftToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApplicantDraftToken_applicantId_idx" ON "ApplicantDraftToken"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantDraftToken_expiresAt_idx" ON "ApplicantDraftToken"("expiresAt");

-- CreateIndex
CREATE INDEX "ApplicantSkill_applicantId_idx" ON "ApplicantSkill"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantSkill_applicantId_skillName_key" ON "ApplicantSkill"("applicantId", "skillName");

-- CreateIndex
CREATE INDEX "ApplicantQualification_applicantId_idx" ON "ApplicantQualification"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantWorkExperience_applicantId_idx" ON "ApplicantWorkExperience"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_registrationNumber_key" ON "Employer"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_licenseNumber_key" ON "Employer"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_userId_key" ON "Employer"("userId");

-- CreateIndex
CREATE INDEX "Employer_status_idx" ON "Employer"("status");

-- CreateIndex
CREATE INDEX "Employer_country_idx" ON "Employer"("country");

-- CreateIndex
CREATE INDEX "Employer_licenseNumber_idx" ON "Employer"("licenseNumber");

-- CreateIndex
CREATE INDEX "Employer_ownerIdNumber_idx" ON "Employer"("ownerIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_contactEmail_key" ON "Employer"("contactEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_contactPhone_key" ON "Employer"("contactPhone");

-- CreateIndex
CREATE INDEX "EmployerApprovalLog_employerId_idx" ON "EmployerApprovalLog"("employerId");

-- CreateIndex
CREATE INDEX "EmployerApprovalLog_actionDate_idx" ON "EmployerApprovalLog"("actionDate");

-- CreateIndex
CREATE INDEX "JobPosting_employerId_idx" ON "JobPosting"("employerId");

-- CreateIndex
CREATE INDEX "JobPosting_status_idx" ON "JobPosting"("status");

-- CreateIndex
CREATE INDEX "JobPosting_country_idx" ON "JobPosting"("country");

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
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountActionToken" ADD CONSTRAINT "AccountActionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalAgency" ADD CONSTRAINT "LocalAgency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalAgencyApprovalLog" ADD CONSTRAINT "LocalAgencyApprovalLog_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "LocalAgency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalAgencyApprovalLog" ADD CONSTRAINT "LocalAgencyApprovalLog_actionBy_fkey" FOREIGN KEY ("actionBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantProfile" ADD CONSTRAINT "ApplicantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantDocument" ADD CONSTRAINT "ApplicantDocument_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantDraftToken" ADD CONSTRAINT "ApplicantDraftToken_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantSkill" ADD CONSTRAINT "ApplicantSkill_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantQualification" ADD CONSTRAINT "ApplicantQualification_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantWorkExperience" ADD CONSTRAINT "ApplicantWorkExperience_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employer" ADD CONSTRAINT "Employer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerApprovalLog" ADD CONSTRAINT "EmployerApprovalLog_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerApprovalLog" ADD CONSTRAINT "EmployerApprovalLog_actionBy_fkey" FOREIGN KEY ("actionBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
