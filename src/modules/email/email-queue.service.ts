import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bull';
import {
  AdvisorGroupAssignedData,
  AdvisorGroupRemovedData,
  EmailPayload,
  EmailType,
  GroupPublishedEmailData,
  PasswordResetEmailData,
  StudentGroupAssignedData,
  StudentGroupChangedData,
} from './email.types';

@Injectable()
export class EmailQueueService {
  private logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendGroupPublishedEmail(data: GroupPublishedEmailData): Promise<void> {
    const payload: EmailPayload = {
      type: EmailType.GROUP_PUBLISHED,
      to: data.email,
      subject: `Bem-vindo ao Mentoriza! Seu grupo foi publicado`,
      data,
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    this.logger.log(`Email queued for ${data.email} (GROUP_PUBLISHED)`);
  }

  async sendReportApprovedEmail(
    to: string,
    groupName: string,
    score: number,
    submissionName: string,
    observations?: string,
  ): Promise<void> {
    const payload: EmailPayload = {
      type: EmailType.REPORT_APPROVED,
      to,
      subject: `✅ Seu relatório foi aprovado!`,
      data: {
        groupName,
        score,
        submissionName,
        observations,
      },
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    this.logger.log(`Email queued for ${to} (REPORT_APPROVED)`);
  }

  async sendReportRejectedEmail(
    to: string,
    groupName: string,
    score: number,
    submissionName: string,
    reasons: string[],
    observations?: string,
  ): Promise<void> {
    const payload: EmailPayload = {
      type: EmailType.REPORT_REJECTED,
      to,
      subject: `❌ Seu relatório necessita de revisão`,
      data: {
        groupName,
        score,
        submissionName,
        observations,
        reasons,
      },
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    this.logger.log(`Email queued for ${to} (REPORT_REJECTED)`);
  }

  async sendReportUnderReviewEmail(
    to: string,
    groupName: string,
    submissionName: string,
  ): Promise<void> {
    const payload: EmailPayload = {
      type: EmailType.REPORT_UNDER_REVIEW,
      to,
      subject: `🔍 Seu relatório está em avaliação`,
      data: {
        groupName,
        submissionName,
      },
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    this.logger.log(`Email queued for ${to} (REPORT_UNDER_REVIEW)`);
  }

  async sendPasswordResetEmail(
    to: string,
    name: string | undefined,
    resetLink: string,
    expiresIn: string = '60 minutos',
  ): Promise<void> {
    const payload: EmailPayload = {
      type: EmailType.PASSWORD_RESET,
      to,
      subject: '🔑 Redefinir sua senha no Mentoriza',
      data: {
        name,
        email: to,
        resetLink,
        expiresIn,
      } as PasswordResetEmailData,
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
    });

    this.logger.log(`Email de reset de senha enfileirado para ${to}`);
  }

  async sendReportUnderReviewToMany(
    recipients: string[],
    groupName: string,
    submissionName: string,
  ): Promise<void> {
    if (recipients.length === 0) {
      this.logger.warn('Nenhum destinatário válido para envio de email');
      return;
    }

    const jobs = recipients.map((to) => ({
      name: 'send-email',
      data: {
        type: EmailType.REPORT_UNDER_REVIEW,
        to,
        subject: `Relatório em avaliação - ${groupName}`,
        data: {
          groupName,
          submissionName,
        },
      } as EmailPayload,
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    }));

    await this.emailQueue.addBulk(jobs);

    this.logger.log(
      `Enfileirados ${recipients.length} emails REPORT_UNDER_REVIEW para o grupo ${groupName}`,
    );
  }

  async sendSubmissionActiveEmail(
    to: string,
    submissionName: string,
    deadlineDate: Date,
    description?: string,
  ): Promise<void> {
    const payload: EmailPayload = {
      type: EmailType.SUBMISSION_ACTIVE,
      to,
      subject: `Nova submissão aberta: ${submissionName}`,
      data: {
        submissionName,
        deadlineDate,
        description,
      },
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });

    this.logger.log(`Email queued for ${to} (SUBMISSION_ACTIVE)`);
  }

  async sendBulkGroupPublishedEmails(
    studentsData: GroupPublishedEmailData[],
  ): Promise<void> {
    for (const data of studentsData) {
      await this.sendGroupPublishedEmail(data);
    }
    this.logger.log(`${studentsData.length} group published emails queued`);
  }

  async sendStudentGroupAssignedEmail(
    data: StudentGroupAssignedData,
  ): Promise<void> {
    const payload: EmailPayload = {
      type: EmailType.STUDENT_GROUP_ASSIGNED,
      to: data.email,
      subject: `Você foi vinculado ao grupo ${data.groupName}`,
      data,
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
    });

    this.logger.log(
      `Email de vinculação inicial enfileirado para ${data.email}`,
    );
  }

  async sendStudentGroupChangedEmail(
    data: StudentGroupChangedData,
  ): Promise<void> {
    const payload: EmailPayload = {
      type: EmailType.STUDENT_GROUP_CHANGED,
      to: data.email,
      subject: `Seu grupo foi alterado para ${data.newGroupName}`,
      data,
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
    });

    this.logger.log(`Email de troca de grupo enfileirado para ${data.email}`);
  }

  async sendAdvisorGroupAssignedEmail(
    data: AdvisorGroupAssignedData,
  ): Promise<void> {
    const role = data.isCoAdvisor ? 'co-orientador' : 'orientador';
    const payload: EmailPayload = {
      type: data.isCoAdvisor
        ? EmailType.COADVISOR_GROUP_ASSIGNED
        : EmailType.ADVISOR_GROUP_ASSIGNED,
      to: data.email,
      subject: `Você foi adicionado como ${role} no grupo ${data.groupName}`,
      data,
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
    });

    this.logger.log(
      `Email de vinculação de ${role} enfileirado para ${data.email}`,
    );
  }

  async sendAdvisorGroupRemovedEmail(
    data: AdvisorGroupRemovedData,
  ): Promise<void> {
    const role = data.isCoAdvisor ? 'co-orientador' : 'orientador';
    const payload: EmailPayload = {
      type: data.isCoAdvisor
        ? EmailType.COADVISOR_GROUP_REMOVED
        : EmailType.ADVISOR_GROUP_REMOVED,
      to: data.email,
      subject: `Você foi removido do grupo ${data.groupName} como ${role}`,
      data,
    };

    await this.emailQueue.add('send-email', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
    });

    this.logger.log(
      `Email de remoção de ${role} enfileirado para ${data.email}`,
    );
  }
}
