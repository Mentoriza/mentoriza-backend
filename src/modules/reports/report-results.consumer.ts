/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';

import { PrismaService } from 'src/prisma/prisma.service';

const RABBITMQ_RESULTS_QUEUE = 'report_results';

@Injectable()
export class ReportResultsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReportResultsConsumer.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async connect() {
    try {
      this.connection = await amqp.connect('amqp://guest:guest@localhost:5672');
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(RABBITMQ_RESULTS_QUEUE, { durable: true });
      await this.channel.consume(
        RABBITMQ_RESULTS_QUEUE,
        async (msg) => {
          if (!msg) return;

          try {
            const raw = JSON.parse(msg.content.toString());

            const data = raw.data ?? raw;

            if (!data?.report_id) {
              this.logger.warn('Mensagem sem report_id, ignorando');
              this.channel.ack(msg);
              return;
            }

            this.logger.log(
              `Processando relatório ${data.report_id} (grupo ${data.group_id})`,
            );

            await this.prisma.report.update({
              where: { id: data.report_id },
              data: {
                score: data.score,
                status: data.status,
                keyResults: data.keyResults,
                observations: data.observations ?? [],
                analyzedAt: new Date(),
              },
            });

            this.logger.log(
              `Relatório ${data.report_id} atualizado com sucesso`,
            );
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error(
              `Erro ao processar mensagem: ${error.message}`,
              error.stack,
            );

            this.channel.nack(msg, false, true);
          }
        },
        { noAck: false },
      );

      this.logger.log(`Consumer iniciado na fila '${RABBITMQ_RESULTS_QUEUE}'`);
    } catch (error) {
      this.logger.error(
        `Falha ao conectar no RabbitMQ: ${error.message}. Tentando reconectar...`,
      );
      setTimeout(() => this.connect(), 5000);
    }
  }
}
