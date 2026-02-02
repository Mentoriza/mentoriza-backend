import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import {
  REPORT_EVALUATION_EVENT,
  ReportEvaluationEvent,
} from 'src/common/events/report/report-evaluation.event';

@Processor('uploads-reports')
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor() {}

  @Process(REPORT_EVALUATION_EVENT)
  async handleReportEvaluation(job: Job<ReportEvaluationEvent>) {
    const { reportId, fileUrl, indicators } = job.data;

    this.logger.log(`Iniciando análise do relatório #${reportId}`);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log(
      `Análise concluída para o relatório #${reportId}, URL: ${fileUrl}, Indicadores: ${indicators.length}`,
    );
  }
}
