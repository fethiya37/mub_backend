import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CompanyExpensesService } from '../services/company-expenses.service';
import { CreateCompanyExpenseDto } from '../dto/company/create-company-expense.dto';
import { UpdateCompanyExpenseDto } from '../dto/company/update-company-expense.dto';
import { ListCompanyExpensesQueryDto } from '../dto/company/list-company-expenses.query.dto';

@ApiTags('Admin Company Expenses')
@ApiBearerAuth()
@Controller('api/admin/company-expenses')
export class AdminCompanyExpensesController {
  constructor(private readonly expenses: CompanyExpensesService) {}

  @RequirePermissions('COMPANY_EXPENSE_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Create company expense' })
  create(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateCompanyExpenseDto) {
    return this.expenses.create(user.userId, dto);
  }

  @RequirePermissions('COMPANY_EXPENSE_MANAGE')
  @Put(':id')
  @ApiOperation({ summary: 'Update company expense' })
  update(@Param('id') id: string, @Body() dto: UpdateCompanyExpenseDto) {
    return this.expenses.update(id, dto);
  }

  @RequirePermissions('COMPANY_EXPENSE_MANAGE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete company expense' })
  remove(@Param('id') id: string) {
    return this.expenses.delete(id);
  }

  @RequirePermissions('COMPANY_EXPENSE_MANAGE')
  @Get()
  @ApiOperation({ summary: 'List company expenses (paged)' })
  @ApiQuery({ name: 'typeId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  list(@Query() q: ListCompanyExpensesQueryDto) {
    return this.expenses.list(q, q.page ? Number(q.page) : 1, q.pageSize ? Number(q.pageSize) : 50);
  }
}
