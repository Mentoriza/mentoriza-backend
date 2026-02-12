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
} from '@nestjs/swagger';
import { EmailQueueService } from 'src/modules/email/email-queue.service';
import { ReportQueueService } from 'src/modules/reports/report-queue.service';
import { ReportsService } from 'src/modules/reports/reports.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IndicatorsService } from '../indicators/indicators.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { BulkUploadService } from './bulk-upload.service';
import { UploadService } from './upload.service';

@Controller('uploads')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly reportQueueService: ReportQueueService,
    private readonly submissionsService: SubmissionsService,
    private readonly indicatorsService: IndicatorsService,
    private readonly reportsService: ReportsService,
    private readonly emailQueueService: EmailQueueService,
    private readonly prisma: PrismaService,
    private readonly bulkUploadService: BulkUploadService,
  ) {}

  @Post('reports-pdf')
  @ApiOperation({
    summary: 'Faz upload de relatório PDF e enfileira para análise',
  })
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
    @Body('groupId') groupId: number,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    const activeSubmission =
      await this.submissionsService.getActiveSubmission();
    if (!activeSubmission) {
      throw new BadRequestException('Nenhuma submissão ativa no momento');
    }

    const { url, publicId } = await this.uploadService.uploadPdf(file, groupId);

    const report = await this.reportsService.createReportRecord({
      groupId: Number(groupId),
      fileUrl: url,
      publicId,
      submissionId: activeSubmission.id,
    });

    const indicators = await this.indicatorsService.findAllActive();

    await this.reportQueueService.enqueueReportEvaluation({
      reportId: report.id,
      groupId: Number(groupId),
      submissionId: activeSubmission.id,
      fileUrl: url,
      publicId,
      indicators,
      requestedAt: new Date().toISOString(),
    });

    return {
      success: true,
      reportId: report.id,
      url,
      publicId,
      message: 'Relatório recebido. Análise em andamento (fila).',
    };
  }

  @Post('students-csv')
  @ApiOperation({ summary: 'Upload em massa de estudantes via CSV ou Excel' })
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
  @ApiResponse({ status: 201, description: 'Estudantes criados' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudents(@UploadedFile() file: Express.Multer.File) {
    return this.bulkUploadService.uploadStudents(file);
  }

  @Post('advisors-csv')
  @ApiOperation({ summary: 'Upload em massa de orientadores via CSV ou Excel' })
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
  @ApiResponse({ status: 201, description: 'Orientadores criados' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAdvisors(@UploadedFile() file: Express.Multer.File) {
    return this.bulkUploadService.uploadAdvisors(file);
  }
}
