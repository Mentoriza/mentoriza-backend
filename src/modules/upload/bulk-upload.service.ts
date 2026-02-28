import { BadRequestException, Injectable } from '@nestjs/common';
import csvParser from 'csv-parser';
import { ROLES, USER_STATUS } from 'src/common/constants';

import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Readable } from 'stream';
import { PasswordUtil } from '../../common/utils/password.util';
import { AuthService } from '../auth/auth.service';
import { EmailQueueService } from '../email/email-queue.service';

type StudentRow = {
  name: string;
  email: string;
  course: string;
  class: string;
  phone?: string | null;
  ra?: string | null;
  birthdate?: string | null;
};

type UploadResult = {
  success: boolean;
  created: number;
  skipped: number;
  errors: Array<{ rowIndex?: number; row?: any; error: string }>;
};

@Injectable()
export class BulkUploadService {
  private studentRoleId: number | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueueService: EmailQueueService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private async getStudentRoleId(tx = this.prisma): Promise<number> {
    if (this.studentRoleId !== null) return this.studentRoleId;

    const role = await tx.role.findUniqueOrThrow({
      where: { name: ROLES.STUDENT },
      select: { id: true },
    });

    this.studentRoleId = role.id;
    return role.id;
  }

  async uploadStudents(file: Express.Multer.File): Promise<UploadResult> {
    if (!file?.buffer) {
      throw new BadRequestException('Nenhum arquivo fornecido');
    }

    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException(
        'Apenas arquivos CSV são permitidos no momento',
      );
    }

    const rawRows = await this.parseCsv(file.buffer);

    const { validRows, errors } = this.validateAndNormalizeRows(rawRows);

    if (validRows.length === 0) {
      return { success: true, created: 0, skipped: 0, errors };
    }

    const uniqueRowsByEmail = new Map<string, StudentRow>();
    const duplicateWarnings: Array<{ row: StudentRow; error: string }> = [];

    for (const row of validRows) {
      if (uniqueRowsByEmail.has(row.email)) {
        duplicateWarnings.push({
          row,
          error: `Email duplicado ignorado (mantida a primeira ocorrência): ${row.email}`,
        });
      } else {
        uniqueRowsByEmail.set(row.email, row);
      }
    }

    const deduplicatedRows = Array.from(uniqueRowsByEmail.values());
    const emails = deduplicatedRows.map((r) => r.email);

    const [existingUsers, existingStudents] = await Promise.all([
      this.prisma.user.findMany({
        where: { email: { in: emails }, deletedAt: null },
        select: { id: true, email: true },
      }),
      this.prisma.student.findMany({
        where: { user: { email: { in: emails }, deletedAt: null } },
        select: { ra: true, user: { select: { email: true } } },
      }),
    ]);

    const emailToUserId = new Map(existingUsers.map((u) => [u.email, u.id]));
    const existingRAs = new Set(
      existingStudents.map((s) => s.ra).filter(Boolean),
    );
    const emailHasStudent = new Map(
      existingStudents.map((s) => [s.user.email, true]),
    );

    const newUsersData: Array<{
      email: string;
      name: string;
      phone: string | null;
      password: string;
    }> = [];

    const existingToProcess: Array<StudentRow & { userId: number }> = [];
    const toSkip: StudentRow[] = [];

    for (const row of deduplicatedRows) {
      const userId = emailToUserId.get(row.email);

      if (userId) {
        if (
          emailHasStudent.get(row.email) ||
          (row.ra && existingRAs.has(row.ra))
        ) {
          toSkip.push(row);
        } else {
          existingToProcess.push({ ...row, userId });
        }
      } else {
        newUsersData.push({
          email: row.email,
          name: row.name,
          phone: row.phone ?? null,
          password: await PasswordUtil.hash(
            PasswordUtil.generateSecurePassword(16),
          ),
        });
      }
    }

    let created = 0;
    const emailsToSend: Array<{
      name: string;
      email: string;
      resetLink: string;
      courseCode: string;
      studentRA: string;
    }> = [];

    const studentRoleId = await this.getStudentRoleId();

    await this.prisma.$transaction(
      async (tx) => {
        if (newUsersData.length > 0) {
          await tx.user.createMany({
            data: newUsersData,
            skipDuplicates: true,
          });

          const createdUsers = await tx.user.findMany({
            where: {
              email: { in: newUsersData.map((u) => u.email) },
              deletedAt: null,
            },
            select: { id: true, email: true },
          });

          const emailToNewUserId = new Map(
            createdUsers.map((u) => [u.email, u.id]),
          );

          const studentsToCreate = deduplicatedRows
            .filter((r) => !emailToUserId.has(r.email))
            .map((r) => ({
              userId: emailToNewUserId.get(r.email)!,
              ra: r.ra ?? null,
              course: r.course,
              class: r.class,
              phone: r.phone ?? null,
              birthDate: r.birthdate ? new Date(r.birthdate) : null,
              status: USER_STATUS.ACTIVE,
            }));

          if (studentsToCreate.length > 0) {
            await tx.student.createMany({ data: studentsToCreate });
          }

          const userRoles = createdUsers.map((u) => ({
            userId: u.id,
            roleId: studentRoleId,
          }));

          if (userRoles.length > 0) {
            await tx.userRole.createMany({
              data: userRoles,
              skipDuplicates: true,
            });
          }

          created += studentsToCreate.length;

          for (const r of deduplicatedRows.filter(
            (r) => !emailToUserId.has(r.email),
          )) {
            const userId = emailToNewUserId.get(r.email);
            if (!userId) continue;

            const token = await this.authService.generateResetToken(userId);
            const frontendUrl =
              this.configService.get<string>('FRONTEND_URL') ??
              'http://localhost:3000';
            const resetLink = `${frontendUrl}/reset-password?token=${token}`;

            emailsToSend.push({
              name: r.name,
              email: r.email,
              resetLink,
              courseCode: r.course,
              studentRA: r.ra ?? '',
            });
          }
        }

        if (existingToProcess.length > 0) {
          const studentsToCreate = existingToProcess.map((r) => ({
            userId: r.userId,
            ra: r.ra ?? null,
            course: r.course,
            class: r.class,
            phone: r.phone ?? null,
            birthDate: r.birthdate ? new Date(r.birthdate) : null,
            status: USER_STATUS.ACTIVE,
          }));

          await tx.student.createMany({ data: studentsToCreate });

          const userRoles = existingToProcess.map((r) => ({
            userId: r.userId,
            roleId: studentRoleId,
          }));

          await tx.userRole.createMany({
            data: userRoles,
            skipDuplicates: true,
          });

          created += existingToProcess.length;
        }
      },
      { timeout: 45000 },
    );

    errors.push(...duplicateWarnings);

    return {
      success: true,
      created,
      skipped: toSkip.length,
      errors,
    };
  }

  private validateAndNormalizeRows(rawRows: any[]): {
    validRows: StudentRow[];
    errors: Array<{ rowIndex?: number; row: any; error: string }>;
  } {
    const validRows: StudentRow[] = [];
    const errors: Array<{ rowIndex: number; row: any; error: string }> = [];

    rawRows.forEach((row, index) => {
      const name = (row.name ?? '').trim();
      const email = (row.email ?? '').trim().toLowerCase();
      const course = (row.course ?? '').trim().toLowerCase();
      const studentClass = (row.class ?? row.className ?? '').trim();

      if (!name || !email || !course || !studentClass) {
        errors.push({
          rowIndex: index + 2,
          row,
          error: 'Campos obrigatórios ausentes: name, email, course, class',
        });
        return;
      }

      if (
        !['engenharia_informatica', 'engenharia_electronica'].includes(course)
      ) {
        errors.push({
          rowIndex: index + 2,
          row,
          error:
            'Curso inválido: deve ser "engenharia_informatica" ou "engenharia_electronica"',
        });
        return;
      }

      validRows.push({
        name,
        email,
        course,
        class: studentClass,
        phone: row.phone ? String(row.phone).trim() : null,
        ra: row.ra ? String(row.ra).trim() : null,
        birthdate: row.birthdate ? String(row.birthdate).trim() : null,
      });
    });

    return { validRows, errors };
  }

  private async parseCsv(buffer: Buffer): Promise<any[]> {
    const results: any[] = [];
    const stream = Readable.from(buffer).pipe(csvParser());

    for await (const row of stream) {
      results.push(row);
    }
    return results;
  }
}
