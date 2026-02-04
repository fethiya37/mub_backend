import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApplicantExpensesService } from '../services/applicant-expenses.service';
import { CreateApplicantExpenseDto } from '../dto/applicant/create-applicant-expense.dto';
import { UpdateApplicantExpenseDto } from '../dto/applicant/update-applicant-expense.dto';
import { ListApplicantExpensesQueryDto } from '../dto/applicant/list-applicant-expenses.query.dto';

@ApiTags('Admin Applicant Expenses')
@ApiBearerAuth()
@Controller('api/admin/applicant-expenses')
export class AdminApplicantExpensesController {
  constructor(private readonly expenses: ApplicantExpensesService) {}

  @RequirePermissions('APPLICANT_EXPENSE_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Create applicant expense' })
  create(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateApplicantExpenseDto) {
    return this.expenses.create(user.userId, dto);
  }

  @RequirePermissions('APPLICANT_EXPENSE_MANAGE')
  @Put(':id')
  @ApiOperation({ summary: 'Update applicant expense' })
  update(@Param('id') id: string, @Body() dto: UpdateApplicantExpenseDto) {
    return this.expenses.update(id, dto);
  }

  @RequirePermissions('APPLICANT_EXPENSE_MANAGE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete applicant expense' })
  remove(@Param('id') id: string) {
    return this.expenses.delete(id);
  }

  @RequirePermissions('APPLICANT_EXPENSE_MANAGE')
  @Get()
  @ApiOperation({ summary: 'List applicant expenses (paged)' })
  @ApiQuery({ name: 'applicantId', required: false })
  @ApiQuery({ name: 'typeId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  list(@Query() q: ListApplicantExpensesQueryDto) {
    return this.expenses.list(q, q.page ? Number(q.page) : 1, q.pageSize ? Number(q.pageSize) : 50);
  }
}
