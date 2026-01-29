import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse } from '@nestjs/swagger';
import { IndicatorsService } from 'src/indicators/indicators.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubmissionsService } from 'src/submissions/submissions.service';
import { UploadService } from './upload.service';

@Controller('uploads')
@ApiResponse({ status: 201, description: 'Upload realizado com sucesso' })
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private indicatorsService: IndicatorsService,
    private submissionsService: SubmissionsService,
    private prisma: PrismaService,
  ) {}

  @Post('pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('groupId') groupId: number,
  ) {
    groupId = 1;
    if (!groupId) throw new BadRequestException('groupId obrigatório');

    const activeSubmission =
      await this.submissionsService.getActiveSubmission();
    if (!activeSubmission) {
      throw new BadRequestException('Nenhuma submissão aberta no momento');
    }

    const { url, publicId } = await this.uploadService.uploadPdf(file, groupId);

    const report = await this.prisma.report.create({
      data: {
        groupId,
        fileUrl: url,
        publicId,
        submissionId: activeSubmission.id,
      },
    });

    const indicators = await this.indicatorsService.findAll();

    console.log({ groupId, indicators, reportId: report.id });

    return { success: true, url, publicId, submissionId: activeSubmission.id };
  }
}
