import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ApplicantExpenseTypesService } from '../services/applicant-expense-types.service';
import { CreateApplicantExpenseTypeDto } from '../dto/applicant/create-applicant-expense-type.dto';
import { UpdateApplicantExpenseTypeDto } from '../dto/applicant/update-applicant-expense-type.dto';

@ApiTags('Admin Applicant Expense Types')
@ApiBearerAuth()
@Controller('api/admin/applicant-expense-types')
export class AdminApplicantExpenseTypesController {
  constructor(private readonly types: ApplicantExpenseTypesService) {}

  @RequirePermissions('APPLICANT_EXPENSE_TYPE_MANAGE')
  @Get()
  @ApiOperation({ summary: 'List applicant expense types' })
  list() {
    return this.types.list();
  }

  @RequirePermissions('APPLICANT_EXPENSE_TYPE_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Create applicant expense type' })
  create(@Body() dto: CreateApplicantExpenseTypeDto) {
    return this.types.create(dto.name);
  }

  @RequirePermissions('APPLICANT_EXPENSE_TYPE_MANAGE')
  @Put(':id')
  @ApiOperation({ summary: 'Update applicant expense type' })
  update(@Param('id') id: string, @Body() dto: UpdateApplicantExpenseTypeDto) {
    return this.types.update(id, dto.name);
  }

  @RequirePermissions('APPLICANT_EXPENSE_TYPE_MANAGE')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete applicant expense type' })
  remove(@Param('id') id: string) {
    return this.types.delete(id);
  }
}
