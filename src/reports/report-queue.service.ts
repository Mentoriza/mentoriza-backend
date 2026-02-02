import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bull';
import {
  REPORT_EVALUATION_EVENT,
  ReportEvaluationEvent,
} from 'src/common/events/report/report-evaluation.event';

/**
 * Serviço responsável por enfileirar tarefas de análise de relatórios.
 */
@Injectable()
export class ReportQueueService {
  private readonly logger = new Logger(ReportQueueService.name);

  constructor(
    @InjectQueue('uploads-reports') private readonly reportQueue: Queue,
  ) {}

  /**
   * Enfileira um relatório para análise assíncrona pelo worker.
   *
   * @param data Payload com informações do relatório e indicadores ativos
   * @param options Opções adicionais do job (tentativas, prioridade, etc.)
   */
  async enqueueReportEvaluation(
    data: ReportEvaluationEvent,
    options: {
      attempts?: number;
      backoffDelay?: number;
      priority?: number;
    } = {},
  ): Promise<void> {
    const defaultOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential' as const,
        delay: options.backoffDelay ?? 10000,
      },
      removeOnComplete: true,
      priority: options.priority ?? 0,
    };

    await this.reportQueue.add(REPORT_EVALUATION_EVENT, data, {
      ...defaultOptions,
      ...options,
    });

    this.logger.log(
      `Job de análise enfileirado para relatório #${data.reportId} (grupo ${data.groupId})`,
    );
  }
}
