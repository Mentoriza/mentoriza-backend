export enum EmailType {
  GROUP_PUBLISHED = 'group_published',
  REPORT_APPROVED = 'report_approved',
  REPORT_REJECTED = 'report_rejected',
  REPORT_UNDER_REVIEW = 'report_under_review',
  SUBMISSION_ACTIVE = 'submission_active',
  PASSWORD_RESET = 'password_reset',

  STUDENT_GROUP_ASSIGNED = 'student_group_assigned',
  STUDENT_GROUP_CHANGED = 'student_group_changed',
  ADVISOR_GROUP_ASSIGNED = 'advisor_group_assigned',
  ADVISOR_GROUP_REMOVED = 'advisor_group_removed',
  COADVISOR_GROUP_ASSIGNED = 'coadvisor_group_assigned',
  COADVISOR_GROUP_REMOVED = 'coadvisor_group_removed',
}

export interface EmailPayload {
  type: EmailType;
  to: string;
  subject: string;
  data: Record<string, any>;
}

export interface GroupPublishedEmailData {
  studentName: string;
  groupName: string;
  email: string;
  password: string;
  advisorName: string;
  advisorEmail?: string;
  coAdvisorName?: string;
  coAdvisorEmail?: string;
  courseCode: string;
  studentRA?: string;
}

export interface ReportApprovedEmailData {
  groupName: string;
  score: number;
  submissionName: string;
  observations?: string;
}

export interface ReportRejectedEmailData {
  groupName: string;
  score: number;
  submissionName: string;
  observations?: string;
  reasons: string[];
}

export interface ReportUnderReviewEmailData {
  groupName: string;
  submissionName: string;
}

export interface SubmissionActiveEmailData {
  submissionName: string;
  deadlineDate: Date;
  description?: string;
}

export interface WelcomeCredentialsEmailData {
  studentName: string;
  email: string;
  password: string;
  groupName: string;
  courseCode: string;
  studentRA?: string;
}

export interface PasswordResetEmailData {
  name?: string;
  email: string;
  resetLink: string;
  expiresIn?: string;
}

export interface StudentGroupAssignedData {
  studentName: string;
  groupName: string;
  email: string;
  course?: string;
}

export interface StudentGroupChangedData {
  studentName: string;
  oldGroupName: string;
  newGroupName: string;
  email: string;
  course?: string;
}

export interface AdvisorGroupAssignedData {
  advisorName: string;
  groupName: string;
  email: string;
  isCoAdvisor: boolean;
  course?: string;
}

export interface AdvisorGroupRemovedData {
  advisorName: string;
  groupName: string;
  email: string;
  isCoAdvisor: boolean;
}
