/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import csvParser from 'csv-parser';
import { ROLES, USER_STATUS } from 'src/common/constants';

import { generateSecurePassword } from 'src/common/utils/password.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

@Injectable()
export class BulkUploadService {
  constructor(private readonly prisma: PrismaService) {}

  private async processCsvStream(
    buffer: Buffer,
    processor: (row: any) => Promise<void>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer)
        .pipe(csvParser())
        .on('data', async (row) => {
          stream.pause();
          try {
            await processor(row);
          } catch (error) {
            reject(error);
            return;
          }
          stream.resume();
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  private processExcelBuffer(
    buffer: Buffer,
    processor: (row: any) => Promise<void>,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const processRows = async () => {
          for (let i = 1; i < rows.length; i++) {
            const row: any = rows[i];
            const data: any = {};
            (rows[0] as string[]).forEach((header, index) => {
              data[header.trim().toLowerCase()] = row[index];
            });
            await processor(data);
          }
          resolve();
        };

        processRows().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  async uploadStudents(
    file: Express.Multer.File,
  ): Promise<{ success: boolean; created: number; errors: any[] }> {
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

    let created = 0;
    const errors: any[] = [];

    const processor = async (row: any) => {
      try {
        // Required fields: name, email, course (Informática or Eletrônica), class (turma)
        // Optional: phone, ra, cpf, birthDate (ISO date string)
        const {
          name,
          email,
          course,
          class: studentClass,
          phone,
          ra,
          cpf,
          birthdate,
        } = row;

        if (!name || !email || !course || !studentClass) {
          throw new Error(
            'Campos obrigatórios ausentes: name, email, course, class',
          );
        }

        if (!['Informática', 'Eletrônica'].includes(course)) {
          throw new Error('Curso inválido: deve ser Informática ou Eletrônica');
        }

        // Check existing user
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
        });
        if (existingUser) {
          throw new Error('Email já em uso');
        }

        const plainPassword = generateSecurePassword(16);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Create User
        const user = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            phone: phone || null,
            status: USER_STATUS.ACTIVE,
          },
        });

        // Create Student
        await this.prisma.student.create({
          data: {
            userId: user.id,
            name,
            email,
            ra: ra || null,
            course,
            class: studentClass,
            phone: phone || null,
            cpf: cpf || null,
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

        created++;
      } catch (error) {
        errors.push({ row, error: error.message });
      }
    };

    try {
      if (file.mimetype === 'text/csv') {
        await this.processCsvStream(file.buffer, processor);
      } else {
        await this.processExcelBuffer(file.buffer, processor);
      }
      return { success: true, created, errors };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao processar o arquivo: ' + error.message,
      );
    }
  }

  async uploadAdvisors(
    file: Express.Multer.File,
  ): Promise<{ success: boolean; created: number; errors: any[] }> {
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

    let created = 0;
    const errors: any[] = [];

    const processor = async (row: any) => {
      try {
        // Required fields: name, email
        // Optional: phone, specialty, lattes
        const { name, email, phone, specialty, lattes } = row;

        if (!name || !email) {
          throw new Error('Campos obrigatórios ausentes: name, email');
        }

        // Check existing user
        const existingUser = await this.prisma.user.findUnique({
          where: { email },
        });
        if (existingUser) {
          throw new Error('Email já em uso');
        }

        // Generate password (random or default)
        const plainPassword = generateSecurePassword(16);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Create User
        const user = await this.prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            phone: phone || null,
            status: USER_STATUS.ACTIVE,
          },
        });

        // Create Advisor
        await this.prisma.advisor.create({
          data: {
            userId: user.id,
            specialty: specialty || null,
            lattes: lattes || null,
          },
        });

        // Assign 'advisor' role if exists
        const advisorRole = await this.prisma.role.findUnique({
          where: { name: ROLES.ADVISOR },
        });
        if (advisorRole) {
          await this.prisma.userRole.create({
            data: { userId: user.id, roleId: advisorRole.id },
          });
        }

        created++;
      } catch (error) {
        errors.push({ row, error: error.message });
      }
    };

    try {
      if (file.mimetype === 'text/csv') {
        await this.processCsvStream(file.buffer, processor);
      } else {
        await this.processExcelBuffer(file.buffer, processor);
      }
      return { success: true, created, errors };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao processar o arquivo: ' + error.message,
      );
    }
  }
}
