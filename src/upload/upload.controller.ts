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
import { EmailQueueService } from 'src/email/email-queue.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportQueueService } from 'src/reports/report-queue.service';
import { ReportsService } from 'src/reports/reports.service';
import { IndicatorsService } from '../indicators/indicators.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { UploadService } from './upload.service';

@Controller('uploads-reports')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly reportQueueService: ReportQueueService,
    private readonly submissionsService: SubmissionsService,
    private readonly indicatorsService: IndicatorsService,
    private readonly reportsService: ReportsService,
    private readonly emailQueueService: EmailQueueService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('pdf')
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
      groupId,
      submissionId: activeSubmission.id,
      fileUrl: url,
      publicId,
      indicators,
      requestedAt: new Date().toISOString(),
    });

    const students = await this.prisma.student.findMany({
      where: { groupId: Number(groupId) },
      select: { email: true },
    });
    const studentEmails = students
      .map((s) => s.email)
      .filter((email) => email && email.trim() !== '');

    const group = await this.prisma.group.findUnique({
      where: { id: Number(groupId) },
      include: {
        advisor: {
          include: { user: { select: { email: true } } },
        },
      },
    });

    const advisorEmail = group?.advisor?.user?.email;

    const allRecipients = [...studentEmails];
    if (advisorEmail) {
      allRecipients.push(advisorEmail);
    }

    const groupName = group?.name || `Grupo ${groupId}`;
    const submissionName = `Submissão ${activeSubmission.stage || activeSubmission.id}`;

    await this.emailQueueService.sendReportUnderReviewToMany(
      allRecipients,
      groupName,
      submissionName,
    );

    return {
      success: true,
      reportId: report.id,
      url,
      publicId,
      message: 'Relatório recebido. Análise em andamento (fila).',
    };
  }
}
