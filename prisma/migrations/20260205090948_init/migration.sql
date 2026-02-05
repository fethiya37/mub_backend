-- CreateEnum
CREATE TYPE "AccountActionTokenType" AS ENUM ('ACCOUNT_SETUP', 'PASSWORD_RESET', 'EMAIL_VERIFY');

-- CreateEnum
CREATE TYPE "LocalAgencyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LocalAgencyApprovalAction" AS ENUM ('APPROVED', 'REJECTED', 'SUSPENDED', 'REACTIVATED');

-- CreateEnum
CREATE TYPE "ApplicantProfileStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ApplicantDocumentType" AS ENUM ('PASSPORT', 'PERSONAL_PHOTO', 'COC_CERTIFICATE', 'APPLICANT_ID', 'OTHER');

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
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SELECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "VisaCaseStatus" AS ENUM ('INITIATED', 'MEDICAL', 'INSURANCE', 'FINGERPRINT', 'EMBASSY', 'LMIS', 'VISA', 'FLIGHT_BOOKED', 'RETURNED', 'DEPLOYED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MedicalFitnessResult" AS ENUM ('FIT', 'UNFIT');

-- CreateEnum
CREATE TYPE "EmbassyProcessStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LMISStatus" AS ENUM ('PENDING', 'ISSUED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VisaAttemptStatus" AS ENUM ('ISSUED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "applicantVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
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
CREATE TABLE "ApplicantProfile" (
    "applicantId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "gender" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "placeOfBirth" TEXT,
    "nationality" TEXT,
    "religion" TEXT,
    "maritalStatus" TEXT,
    "numberOfChildren" INTEGER,
    "occupation" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "laborId" TEXT,
    "applicationNumber" TEXT NOT NULL,
    "profileStatus" "ApplicantProfileStatus" NOT NULL DEFAULT 'DRAFT',
    "passportNumber" TEXT,
    "passportPlace" TEXT,
    "passportIssueDate" TIMESTAMP(3),
    "passportExpiry" TIMESTAMP(3),
    "registrationSource" "ApplicantRegistrationSource" NOT NULL DEFAULT 'SELF',
    "createdBy" TEXT,
    "rejectionReason" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantProfile_pkey" PRIMARY KEY ("applicantId")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "address" TEXT,
    "idFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantDocument" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "documentType" "ApplicantDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantSkill" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "hasSkill" BOOLEAN NOT NULL DEFAULT true,
    "willingToLearn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantQualification" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantWorkExperience" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "country" TEXT,
    "yearsWorked" INTEGER,
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
    "ownerIdFileUrl" TEXT,
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
    "thumbnailUrl" TEXT,
    "contractType" "ContractType" NOT NULL,
    "vacancies" INTEGER NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "cvFileUrl" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "sponsorIdFileUrl" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaCase" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "partnerId" TEXT,
    "jobId" TEXT,
    "destinationCountry" TEXT NOT NULL,
    "status" "VisaCaseStatus" NOT NULL DEFAULT 'INITIATED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "caseManagerUserId" TEXT NOT NULL,
    "sponsorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaMedical" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "reportFileUrl" TEXT NOT NULL,
    "result" "MedicalFitnessResult" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaMedical_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaInsurance" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "providerName" TEXT,
    "policyNumber" TEXT,
    "policyFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaFingerprint" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaFingerprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmbassyProcess" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "status" "EmbassyProcessStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmbassyProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LMISProcess" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "status" "LMISStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LMISProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaAttempt" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "VisaAttemptStatus" NOT NULL,
    "applicationNumber" TEXT,
    "visaNumber" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "barcodeValue" TEXT,
    "barcodeImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightBooking" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "pnr" TEXT NOT NULL,
    "airline" TEXT,
    "departureAt" TIMESTAMP(3),
    "arrivalAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlightBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaReturn" (
    "id" TEXT NOT NULL,
    "visaCaseId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "returnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisaReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyExpenseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyExpenseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyExpense" (
    "id" TEXT NOT NULL,
    "typeId" TEXT,
    "typeNameOther" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "referenceNo" TEXT,
    "description" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantExpenseType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantExpenseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantExpense" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "typeId" TEXT,
    "typeNameOther" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "referenceNo" TEXT,
    "description" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantExpense_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "ApplicantDraftToken_tokenHash_key" ON "ApplicantDraftToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApplicantDraftToken_applicantId_idx" ON "ApplicantDraftToken"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantDraftToken_expiresAt_idx" ON "ApplicantDraftToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_userId_key" ON "ApplicantProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_phone_key" ON "ApplicantProfile"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_laborId_key" ON "ApplicantProfile"("laborId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_applicationNumber_key" ON "ApplicantProfile"("applicationNumber");

-- CreateIndex
CREATE INDEX "ApplicantProfile_passportNumber_idx" ON "ApplicantProfile"("passportNumber");

-- CreateIndex
CREATE INDEX "ApplicantProfile_laborId_idx" ON "ApplicantProfile"("laborId");

-- CreateIndex
CREATE INDEX "ApplicantProfile_profileStatus_idx" ON "ApplicantProfile"("profileStatus");

-- CreateIndex
CREATE INDEX "ApplicantProfile_registrationSource_idx" ON "ApplicantProfile"("registrationSource");

-- CreateIndex
CREATE INDEX "EmergencyContact_applicantId_idx" ON "EmergencyContact"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantDocument_documentType_idx" ON "ApplicantDocument"("documentType");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantDocument_applicantId_documentType_key" ON "ApplicantDocument"("applicantId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "ApplicantSkill_applicantId_idx" ON "ApplicantSkill"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantSkill_skillId_idx" ON "ApplicantSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantSkill_applicantId_skillId_key" ON "ApplicantSkill"("applicantId", "skillId");

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
CREATE INDEX "JobApplication_applicantId_idx" ON "JobApplication"("applicantId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE INDEX "JobApplication_jobPostingId_idx" ON "JobApplication"("jobPostingId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobPostingId_applicantId_key" ON "JobApplication"("jobPostingId", "applicantId");

-- CreateIndex
CREATE INDEX "VisaCase_applicantId_idx" ON "VisaCase"("applicantId");

-- CreateIndex
CREATE INDEX "VisaCase_partnerId_idx" ON "VisaCase"("partnerId");

-- CreateIndex
CREATE INDEX "VisaCase_jobId_idx" ON "VisaCase"("jobId");

-- CreateIndex
CREATE INDEX "VisaCase_destinationCountry_idx" ON "VisaCase"("destinationCountry");

-- CreateIndex
CREATE INDEX "VisaCase_status_idx" ON "VisaCase"("status");

-- CreateIndex
CREATE INDEX "VisaCase_caseManagerUserId_idx" ON "VisaCase"("caseManagerUserId");

-- CreateIndex
CREATE INDEX "VisaCase_sponsorId_idx" ON "VisaCase"("sponsorId");

-- CreateIndex
CREATE INDEX "VisaCase_isActive_idx" ON "VisaCase"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VisaCase_applicantId_jobId_isActive_key" ON "VisaCase"("applicantId", "jobId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VisaCase_applicantId_partnerId_isActive_key" ON "VisaCase"("applicantId", "partnerId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "VisaMedical_visaCaseId_key" ON "VisaMedical"("visaCaseId");

-- CreateIndex
CREATE INDEX "VisaMedical_result_idx" ON "VisaMedical"("result");

-- CreateIndex
CREATE INDEX "VisaMedical_expiresAt_idx" ON "VisaMedical"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisaInsurance_visaCaseId_key" ON "VisaInsurance"("visaCaseId");

-- CreateIndex
CREATE INDEX "VisaInsurance_policyNumber_idx" ON "VisaInsurance"("policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VisaFingerprint_visaCaseId_key" ON "VisaFingerprint"("visaCaseId");

-- CreateIndex
CREATE INDEX "VisaFingerprint_isDone_idx" ON "VisaFingerprint"("isDone");

-- CreateIndex
CREATE UNIQUE INDEX "EmbassyProcess_visaCaseId_key" ON "EmbassyProcess"("visaCaseId");

-- CreateIndex
CREATE INDEX "EmbassyProcess_status_idx" ON "EmbassyProcess"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LMISProcess_visaCaseId_key" ON "LMISProcess"("visaCaseId");

-- CreateIndex
CREATE INDEX "LMISProcess_status_idx" ON "LMISProcess"("status");

-- CreateIndex
CREATE INDEX "VisaAttempt_visaCaseId_idx" ON "VisaAttempt"("visaCaseId");

-- CreateIndex
CREATE INDEX "VisaAttempt_status_idx" ON "VisaAttempt"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VisaAttempt_visaCaseId_attemptNumber_key" ON "VisaAttempt"("visaCaseId", "attemptNumber");

-- CreateIndex
CREATE INDEX "FlightBooking_visaCaseId_idx" ON "FlightBooking"("visaCaseId");

-- CreateIndex
CREATE INDEX "FlightBooking_pnr_idx" ON "FlightBooking"("pnr");

-- CreateIndex
CREATE INDEX "VisaReturn_visaCaseId_idx" ON "VisaReturn"("visaCaseId");

-- CreateIndex
CREATE INDEX "VisaReturn_returnedAt_idx" ON "VisaReturn"("returnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyExpenseType_name_key" ON "CompanyExpenseType"("name");

-- CreateIndex
CREATE INDEX "CompanyExpenseType_name_idx" ON "CompanyExpenseType"("name");

-- CreateIndex
CREATE INDEX "CompanyExpense_typeId_idx" ON "CompanyExpense"("typeId");

-- CreateIndex
CREATE INDEX "CompanyExpense_expenseDate_idx" ON "CompanyExpense"("expenseDate");

-- CreateIndex
CREATE INDEX "CompanyExpense_createdBy_idx" ON "CompanyExpense"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantExpenseType_name_key" ON "ApplicantExpenseType"("name");

-- CreateIndex
CREATE INDEX "ApplicantExpenseType_name_idx" ON "ApplicantExpenseType"("name");

-- CreateIndex
CREATE INDEX "ApplicantExpense_applicantId_idx" ON "ApplicantExpense"("applicantId");

-- CreateIndex
CREATE INDEX "ApplicantExpense_typeId_idx" ON "ApplicantExpense"("typeId");

-- CreateIndex
CREATE INDEX "ApplicantExpense_expenseDate_idx" ON "ApplicantExpense"("expenseDate");

-- CreateIndex
CREATE INDEX "ApplicantExpense_createdBy_idx" ON "ApplicantExpense"("createdBy");

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
ALTER TABLE "ApplicantDraftToken" ADD CONSTRAINT "ApplicantDraftToken_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantProfile" ADD CONSTRAINT "ApplicantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantDocument" ADD CONSTRAINT "ApplicantDocument_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantSkill" ADD CONSTRAINT "ApplicantSkill_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantSkill" ADD CONSTRAINT "ApplicantSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "JobPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_caseManagerUserId_fkey" FOREIGN KEY ("caseManagerUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaCase" ADD CONSTRAINT "VisaCase_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaMedical" ADD CONSTRAINT "VisaMedical_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaInsurance" ADD CONSTRAINT "VisaInsurance_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaFingerprint" ADD CONSTRAINT "VisaFingerprint_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmbassyProcess" ADD CONSTRAINT "EmbassyProcess_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LMISProcess" ADD CONSTRAINT "LMISProcess_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaAttempt" ADD CONSTRAINT "VisaAttempt_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaReturn" ADD CONSTRAINT "VisaReturn_visaCaseId_fkey" FOREIGN KEY ("visaCaseId") REFERENCES "VisaCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyExpense" ADD CONSTRAINT "CompanyExpense_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CompanyExpenseType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantExpense" ADD CONSTRAINT "ApplicantExpense_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "ApplicantProfile"("applicantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantExpense" ADD CONSTRAINT "ApplicantExpense_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ApplicantExpenseType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
