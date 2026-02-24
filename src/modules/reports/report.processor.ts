import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportsService } from './reports.service';

export const REPORT_RESULTS_EVENT = 'report.evaluation.completed';

@Controller()
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService,
  ) {
    this.logger.log(
      `ReportProcessor initialized and listening for ${REPORT_RESULTS_EVENT}`,
    );
  }

  @EventPattern(REPORT_RESULTS_EVENT)
  async handleReportResults(
    @Payload()
    data: {
      report_id: number;
      group_id: number;
      keyResults: Record<string, number>;
      observations: string[];
      score: number;
      status: ReportStatus;
      processed_at: string;
    },
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    console.log('Raw incoming message:', JSON.stringify(data, null, 2));
    console.log('Full context message:', originalMsg);
    console.log('data-report', data);

    try {
      this.logger.log(
        `Resultado de análise recebido para relatório ID ${data.report_id} (grupo ${data.group_id})`,
      );

      await this.prisma.report.update({
        where: { id: data.report_id },
        data: {
          score: data.score,
          status: data.status,
          keyResults: JSON.stringify(data.keyResults),
          observations: data.observations,
          analyzedAt: new Date(),
        },
      });

      this.logger.log(
        `Relatório ${data.report_id} atualizado com sucesso no banco.`,
      );

      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(
        `Erro ao salvar resultado do relatório ${data?.report_id ?? 'desconhecido'}: ${error.message}`,
        error.stack,
      );

      channel.nack(originalMsg, false, true);
    }
  }
}
