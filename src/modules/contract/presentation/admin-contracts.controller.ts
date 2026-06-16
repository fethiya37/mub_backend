import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import crypto from 'crypto';
import { join } from 'path';

import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { ContractService } from '../services/contract.service';
import { CreateContractDto } from '../dto/admin/create-contract.dto';
import { UpdateContractDto } from '../dto/admin/update-contract.dto';
import {
  buildUploadsRoot,
  ensureDir,
  safeExt,
  maxUploadBytes,
} from '../../../common/utils/upload/upload.utils';

function contractDiskStorage() {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const root = buildUploadsRoot();
      const dest = join(root, 'contracts');
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const ext = safeExt(file.originalname);
      const name = crypto.randomBytes(16).toString('hex');
      cb(null, `${name}${ext}`);
    },
  });
}

@ApiTags('Admin Contracts')
@ApiBearerAuth()
@Controller('api/admin/contracts')
export class AdminContractsController {
  constructor(private readonly contractService: ContractService) {}

  @RequirePermissions('CONTRACT_CREATE')
  @Post()
  @ApiOperation({ summary: 'Issue contract for visa case' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('contractFile', {
      storage: contractDiskStorage(),
      limits: { fileSize: maxUploadBytes() },
    }),
  )
  async createContract(
    @Body() dto: CreateContractDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const contractFileUrl = file ? `/uploads/contracts/${file.filename}` : null;
    if (!contractFileUrl) {
      throw new Error('Contract file is required');
    }
    return this.contractService.createContract(dto, contractFileUrl);
  }

  @RequirePermissions('CONTRACT_VIEW')
  @Get()
  @ApiOperation({ summary: 'List contracts' })
  @ApiQuery({ name: 'visaCaseId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  async listContracts(
    @Query('visaCaseId') visaCaseId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? Math.min(parseInt(pageSize, 10), 100) : 20;
    return this.contractService.listContracts(
      { visaCaseId, status },
      pageNum,
      pageSizeNum,
    );
  }

  @RequirePermissions('CONTRACT_VIEW')
  @Get(':id')
  @ApiOperation({ summary: 'Get contract by ID' })
  async getContract(@Param('id') id: string) {
    return this.contractService.getContractById(id);
  }

  @RequirePermissions('CONTRACT_VIEW')
  @Get('visa-case/:visaCaseId')
  @ApiOperation({ summary: 'Get contract by visa case ID' })
  async getByVisaCase(@Param('visaCaseId') visaCaseId: string) {
    return this.contractService.getContractByVisaCase(visaCaseId);
  }

  @RequirePermissions('CONTRACT_UPDATE')
  @Put(':id/sign')
  @ApiOperation({ summary: 'Upload signed contract' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('signedFile', {
      storage: contractDiskStorage(),
      limits: { fileSize: maxUploadBytes() },
    }),
  )
  async uploadSignedContract(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const signedFileUrl = file ? `/uploads/contracts/${file.filename}` : null;
    if (!signedFileUrl) {
      throw new Error('Signed contract file is required');
    }
    return this.contractService.uploadSignedContract(id, signedFileUrl);
  }

  @RequirePermissions('CONTRACT_UPDATE')
  @Put(':id')
  @ApiOperation({ summary: 'Update contract details' })
  async updateContract(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
  ) {
    return this.contractService.updateContract(id, dto);
  }
}
