export const REPORT_EVALUATION_EVENT = 'report.evaluation.requested';

export interface ReportEvaluationEvent {
  reportId: number;
  groupId: number;
  submissionId: number;
  fileUrl: string;
  publicId?: string;
  indicators: {
    createdAt: Date;
    updatedAt: Date;
    id: number;
    title: string;
    min: number | null;
    max: number | null;
    type: string;
    isActive: boolean;
  }[];
  requestedAt?: string;
  priority?: 'low' | 'normal' | 'high';
}
