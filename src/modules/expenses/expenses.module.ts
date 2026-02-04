import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { ApplicantsModule } from '../applicants/applicants.module';

import { AdminCompanyExpenseTypesController } from './presentation/admin-company-expense-types.controller';
import { AdminCompanyExpensesController } from './presentation/admin-company-expenses.controller';
import { AdminApplicantExpenseTypesController } from './presentation/admin-applicant-expense-types.controller';
import { AdminApplicantExpensesController } from './presentation/admin-applicant-expenses.controller';

import { CompanyExpenseTypesService } from './services/company-expense-types.service';
import { CompanyExpensesService } from './services/company-expenses.service';
import { ApplicantExpenseTypesService } from './services/applicant-expense-types.service';
import { ApplicantExpensesService } from './services/applicant-expenses.service';

import { CompanyExpenseTypeRepository } from './repositories/company-expense-type.repository';
import { CompanyExpenseRepository } from './repositories/company-expense.repository';
import { ApplicantExpenseTypeRepository } from './repositories/applicant-expense-type.repository';
import { ApplicantExpenseRepository } from './repositories/applicant-expense.repository';

import { CompanyExpenseTypePrismaRepository } from './prisma/company-expense-type.prisma-repository';
import { CompanyExpensePrismaRepository } from './prisma/company-expense.prisma-repository';
import { ApplicantExpenseTypePrismaRepository } from './prisma/applicant-expense-type.prisma-repository';
import { ApplicantExpensePrismaRepository } from './prisma/applicant-expense.prisma-repository';

@Module({
  imports: [ApplicantsModule],
  controllers: [
    AdminCompanyExpenseTypesController,
    AdminCompanyExpensesController,
    AdminApplicantExpenseTypesController,
    AdminApplicantExpensesController
  ],
  providers: [
    PrismaService,

    CompanyExpenseTypesService,
    CompanyExpensesService,
    ApplicantExpenseTypesService,
    ApplicantExpensesService,

    { provide: CompanyExpenseTypeRepository, useClass: CompanyExpenseTypePrismaRepository },
    { provide: CompanyExpenseRepository, useClass: CompanyExpensePrismaRepository },
    { provide: ApplicantExpenseTypeRepository, useClass: ApplicantExpenseTypePrismaRepository },
    { provide: ApplicantExpenseRepository, useClass: ApplicantExpensePrismaRepository }
  ],
  exports: [CompanyExpenseRepository, ApplicantExpenseRepository]
})
export class ExpensesModule {}
