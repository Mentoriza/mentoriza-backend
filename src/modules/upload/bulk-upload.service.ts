/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import csvParser from 'csv-parser';
import { ROLES, USER_STATUS } from 'src/common/constants';

import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';
import { PasswordUtil } from '../../common/utils/password.util';
import { AuthService } from '../auth/auth.service';
import { EmailQueueService } from '../email/email-queue.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class BulkUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private emailService: EmailService,
    private emailQueueService: EmailQueueService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private async processCsvStream(
    buffer: Buffer,
    processor: (
      row: any,
    ) => Promise<{ created: boolean; skipped?: boolean; error?: string }>,
  ): Promise<{ created: number; skipped: number; errors: any[] }> {
    return new Promise((resolve, reject) => {
      let created = 0;
      let skipped = 0;
      const errors: any[] = [];
      const stream = Readable.from(buffer)
        .pipe(csvParser())
        .on('data', async (row) => {
          stream.pause();
          try {
            const result = await processor(row);
            if (result.created) created++;
            if (result.skipped) skipped++;
            if (result.error) errors.push({ row, error: result.error });
          } catch (error) {
            errors.push({ row, error: error.message });
          }
          stream.resume();
        })
        .on('end', () => resolve({ created, skipped, errors }))
        .on('error', reject);
    });
  }

  private async processExcelBuffer(
    buffer: Buffer,
    processor: (
      row: any,
    ) => Promise<{ created: boolean; skipped?: boolean; error?: string }>,
  ): Promise<{ created: number; skipped: number; errors: any[] }> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let created = 0;
      let skipped = 0;
      const errors: any[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row: any = rows[i];
        const data: any = {};
        (rows[0] as string[]).forEach((header, index) => {
          data[header.trim().toLowerCase()] = row[index];
        });
        const result = await processor(data);
        if (result.created) created++;
        if (result.skipped) skipped++;
        if (result.error) errors.push({ row: data, error: result.error });
      }

      return { created, skipped, errors };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao processar o arquivo Excel: ' + error.message,
      );
    }
  }

  async uploadStudents(file: Express.Multer.File): Promise<{
    success: boolean;
    created: number;
    skipped: number;
    errors: any[];
  }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }

    if (
      ![
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(file.mimetype)
    ) {
      throw new BadRequestException(
        'Apenas arquivos CSV ou Excel são permitidos',
      );
    }

    const processor = async (
      row: any,
    ): Promise<{ created: boolean; skipped?: boolean; error?: string }> => {
      const {
        name,
        email,
        course,
        class: studentClass,
        phone,
        ra,
        birthdate,
      } = row;

      if (!name || !email || !course || !studentClass) {
        return {
          created: false,
          error: 'Campos obrigatórios ausentes: name, email, course, class',
        };
      }

      if (!['Informática', 'Eletrônica'].includes(course)) {
        return {
          created: false,
          error: 'Curso inválido: deve ser Informática ou Eletrônica',
        };
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const existingStudent = await this.prisma.student.findUnique({
          where: { userId: existingUser.id },
        });
        if (existingStudent) {
          return { created: false, skipped: true };
        }

        await this.prisma.student.create({
          data: {
            userId: existingUser.id,
            ra: ra || null,
            course,
            class: studentClass,
            phone: phone || null,
            birthDate: birthdate ? new Date(birthdate) : null,
            status: USER_STATUS.ACTIVE,
          },
        });

        const studentRole = await this.prisma.role.findUnique({
          where: { name: ROLES.STUDENT },
        });
        if (studentRole) {
          await this.prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: existingUser.id,
                roleId: studentRole.id,
              },
            },
            update: {},
            create: { userId: existingUser.id, roleId: studentRole.id },
          });
        }

        return { created: true };
      }

      const plainPassword = PasswordUtil.generateSecurePassword(16);
      const hashedPassword = await PasswordUtil.hash(plainPassword);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          status: USER_STATUS.ACTIVE,
        },
      });

      await this.prisma.student.create({
        data: {
          userId: user.id,
          ra: ra || null,
          course,
          class: studentClass,
          phone: phone || null,
          birthDate: birthdate ? new Date(birthdate) : null,
          status: USER_STATUS.ACTIVE,
        },
      });

      const studentRole = await this.prisma.role.findUnique({
        where: { name: ROLES.STUDENT },
      });
      if (studentRole) {
        await this.prisma.userRole.create({
          data: { userId: user.id, roleId: studentRole.id },
        });
      }

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const resetToken = await this.authService.generateResetToken(user.id);
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      await this.emailQueueService.sendWelcomeCredentialsEmail({
        studentName: name,
        email,

        courseCode: course || '',
        studentRA: ra || '',
        resetLink,
        password: '',
      });

      return { created: true };
    };

    let result;
    if (file.mimetype === 'text/csv') {
      result = await this.processCsvStream(file.buffer, processor);
    } else {
      result = await this.processExcelBuffer(file.buffer, processor);
    }

    return { success: true, ...result };
  }

  async uploadAdvisors(file: Express.Multer.File): Promise<{
    success: boolean;
    created: number;
    skipped: number;
    errors: any[];
  }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }

    if (
      ![
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(file.mimetype)
    ) {
      throw new BadRequestException(
        'Apenas arquivos CSV ou Excel são permitidos',
      );
    }

    const processor = async (
      row: any,
    ): Promise<{ created: boolean; skipped?: boolean; error?: string }> => {
      const { name, email, phone, specialty, lattes } = row;

      if (!name || !email) {
        return {
          created: false,
          error: 'Campos obrigatórios ausentes: name, email',
        };
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const existingAdvisor = await this.prisma.advisor.findUnique({
          where: { userId: existingUser.id },
        });
        if (existingAdvisor) {
          return { created: false, skipped: true }; // Pular se advisor já existe
        }
        // Se user existe mas não é advisor, criar apenas o advisor
        await this.prisma.advisor.create({
          data: {
            userId: existingUser.id,
            specialty: specialty || null,
            lattes: lattes || null,
          },
        });

        const advisorRole = await this.prisma.role.findUnique({
          where: { name: ROLES.ADVISOR },
        });
        if (advisorRole) {
          await this.prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: existingUser.id,
                roleId: advisorRole.id,
              },
            },
            update: {},
            create: { userId: existingUser.id, roleId: advisorRole.id },
          });
        }

        return { created: true };
      }

      // Se user não existe, criar user + advisor
      const plainPassword = PasswordUtil.generateSecurePassword(16);
      const hashedPassword = await PasswordUtil.hash(plainPassword);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          status: USER_STATUS.ACTIVE,
        },
      });

      await this.prisma.advisor.create({
        data: {
          userId: user.id,
          specialty: specialty || null,
          lattes: lattes || null,
        },
      });

      const advisorRole = await this.prisma.role.findUnique({
        where: { name: ROLES.ADVISOR },
      });
      if (advisorRole) {
        await this.prisma.userRole.create({
          data: { userId: user.id, roleId: advisorRole.id },
        });
      }

      // Opcional: enviar email com senha apenas para novos users
      // await this.emailService.sendWelcomeEmail({ email, name, plainPassword });

      return { created: true };
    };

    let result;
    if (file.mimetype === 'text/csv') {
      result = await this.processCsvStream(file.buffer, processor);
    } else {
      result = await this.processExcelBuffer(file.buffer, processor);
    }

    return { success: true, ...result };
  }
}
