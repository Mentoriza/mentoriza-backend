import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportQueueService } from 'src/modules/reports/report-queue.service';
import { ReportsService } from 'src/modules/reports/reports.service';
import { IndicatorsService } from '../indicators/indicators.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { BulkUploadService } from './bulk-upload.service';
import { UploadService } from './upload.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly reportQueueService: ReportQueueService,
    private readonly submissionsService: SubmissionsService,
    private readonly indicatorsService: IndicatorsService,
    private readonly reportsService: ReportsService,

    private readonly bulkUploadService: BulkUploadService,
  ) {}

  @Post('reports-pdf')
  @ApiOperation({ summary: 'Upload de relatório PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        groupId: { type: 'number', example: 1 },
      },
      required: ['file', 'groupId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Relatório recebido e enfileirado' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('groupId') groupId: string,
  ) {
    const groupIdNumber = Number(groupId);
    if (isNaN(groupIdNumber) || groupIdNumber <= 0) {
      throw new BadRequestException('groupId deve ser um número positivo');
    }

    return this.uploadService.uploadAndProcessPdf(file, groupIdNumber);
  }

  @Post('students-csv')
  @ApiOperation({ summary: 'Bulk upload students via CSV or Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Students created' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudents(@UploadedFile() file: Express.Multer.File) {
    return this.bulkUploadService.uploadStudents(file);
  }

  @Post('advisors-csv')
  @ApiOperation({ summary: 'Bulk upload advisors via CSV or Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Advisors created' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAdvisors(@UploadedFile() file: Express.Multer.File) {
    return this.bulkUploadService.uploadAdvisors(file);
  }
}
