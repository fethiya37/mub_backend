import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CompanyExpenseTypesService } from '../services/company-expense-types.service';
import { CreateCompanyExpenseTypeDto } from '../dto/company/create-company-expense-type.dto';
import { UpdateCompanyExpenseTypeDto } from '../dto/company/update-company-expense-type.dto';

@ApiTags('Admin Company Expense Types')
@ApiBearerAuth()
@Controller('api/admin/company-expense-types')
export class AdminCompanyExpenseTypesController {
  constructor(private readonly types: CompanyExpenseTypesService) {}

  @RequirePermissions('COMPANY_EXPENSE_TYPE_MANAGE')
  @Get()
  @ApiOperation({ summary: 'List company expense types' })
  list() {
    return this.types.list();
  }

  @RequirePermissions('COMPANY_EXPENSE_TYPE_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Create company expense type' })
  create(@Body() dto: CreateCompanyExpenseTypeDto) {
    return this.types.create(dto.name);
  }

  @RequirePermissions('COMPANY_EXPENSE_TYPE_MANAGE')
  @Put(':id')
  @ApiOperation({ summary: 'Update company expense type' })
  update(@Param('id') id: string, @Body() dto: UpdateCompanyExpenseTypeDto) {
    return this.types.update(id, dto.name);
  }

  @RequirePermissions('COMPANY_EXPENSE_TYPE_MANAGE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete company expense type' })
  remove(@Param('id') id: string) {
    return this.types.delete(id);
  }
}
