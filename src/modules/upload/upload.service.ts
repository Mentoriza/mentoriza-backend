import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ReportEvaluationEvent } from 'src/common/events/report/report-evaluation.event';
import { IndicatorsService } from 'src/modules/indicators/indicators.service';
import { ReportQueueService } from 'src/modules/reports/report-queue.service';
import { ReportsService } from 'src/modules/reports/reports.service';
import { SubmissionsService } from 'src/modules/submissions/submissions.service';
import { PrismaService } from 'src/prisma/prisma.service'; // ajuste o path
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
    private readonly submissionsService: SubmissionsService,
    private readonly indicatorsService: IndicatorsService,
    private readonly reportQueueService: ReportQueueService,
  ) {}

  async uploadAndProcessPdf(
    file: Express.Multer.File,
    groupId: number,
  ): Promise<{
    success: boolean;
    reportId: number;
    url: string;
    publicId: string;
    message: string;
  }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são permitidos');
    }

    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        `O arquivo excede o limite de ${MAX_SIZE / (1024 * 1024)}MB`,
      );
    }

    const activeSubmission =
      await this.submissionsService.getActiveSubmission();
    if (!activeSubmission) {
      throw new BadRequestException('Não há submissão ativa no momento');
    }

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    const { url, publicId } = await this.uploadToCloudinary(file, groupId);

    const report = await this.reportsService.createReportRecord({
      groupId,
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
    } as ReportEvaluationEvent);

    return {
      success: true,
      reportId: report.id,
      url,
      publicId,
      message:
        'Relatório recebido. Avaliação em andamento. E-mails enviados ao grupo.',
    };
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    groupId: number,
  ): Promise<{ url: string; publicId: string }> {
    const now = new Date();
    const baseName = `report_${now
      .toISOString()
      .replace(/T/, '_')
      .replace(/\..+/, '')
      .replace(/:/g, '-')}.pdf`;

    const publicId = `reports/${groupId}/${baseName}`;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', public_id: publicId },
        (error, result) => {
          if (error) {
            reject(
              new InternalServerErrorException(
                `Falha no upload para Cloudinary: ${error.message}`,
              ),
            );
            return;
          }
          if (!result) {
            reject(
              new InternalServerErrorException(
                'Resultado do upload indefinido',
              ),
            );
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
