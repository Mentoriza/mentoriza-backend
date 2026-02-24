import { Indicator } from '@prisma/client';

export const REPORT_EVALUATION_EVENT = 'report.evaluation.requested';

export interface ReportEvaluationEvent {
  reportId: number;
  groupId: number;
  submissionId: number;
  fileUrl: string;
  publicId?: string;
  indicators: Indicator[];
  requestedAt?: string;
  priority?: 'low' | 'normal' | 'high';
}
