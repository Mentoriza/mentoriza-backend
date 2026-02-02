import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportQueueService } from './report-queue.service';
import { ReportProcessor } from './report.processor';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    EmailModule,
    BullModule.registerQueue({
      name: 'uploads-reports',
    }),
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    PrismaService,
    ReportQueueService,
    ReportProcessor,
  ],
  exports: [ReportsService, ReportQueueService],
})
export class ReportsModule {}
