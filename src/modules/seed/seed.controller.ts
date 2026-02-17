import { Controller, Get } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  @Get('roles')
  async seedRoles() {
    try {
      const roles = [
        { name: 'admin', description: 'Administrador do sistema' },
        { name: 'coordinator', description: 'Coordenador do curso' },
        { name: 'advisor', description: 'Orientador / Coorientador' },
        { name: 'student', description: 'Aluno' },
      ];

      let created = 0;
      for (const r of roles) {
        const existing = await this.prisma.role.findUnique({
          where: { name: r.name },
        });
        if (!existing) {
          await this.prisma.role.create({ data: r });
          created++;
        }
      }

      return {
        message: 'Roles seed concluído',
        created,
        totalAttempted: roles.length,
      };
    } catch (error) {
      return { message: 'Erro ao seed roles', error: (error as Error).message };
    }
  }

  @Get('users')
  async seedUsersAndRoles() {
    try {
      const defaultPassword = await this.hashPassword('12345678');

      const usersData = [
        {
          email: 'kobifi9638@hopesx.com',
          name: 'Dr. Carlos Almeida',
          phone: '(11) 98765-4321',
          roleName: 'coordinator',
        },
        {
          email: 'wedigony@fxzig.com',
          name: 'Professora Mariana Costa',
          phone: '(21) 99876-5432',
          roleName: 'advisor',
        },
        {
          email: 'aluno.teste@exemplo.com',
          name: 'João Pedro Silva',
          phone: '(31) 91234-5678',
          roleName: 'student',
        },
      ];

      let createdUsers = 0;
      let assignedRoles = 0;

      for (const u of usersData) {
        const user = await this.prisma.user.upsert({
          where: { email: u.email },
          update: {},
          create: {
            email: u.email,
            password: defaultPassword,
            name: u.name,
            phone: u.phone,
            status: 'active',
          },
        });

        if (user) createdUsers++; // conta mesmo se já existia

        const role = await this.prisma.role.findUnique({
          where: { name: u.roleName },
        });

        if (role) {
          await this.prisma.userRole.upsert({
            where: { userId_roleId: { userId: user.id, roleId: role.id } },
            update: {},
            create: { userId: user.id, roleId: role.id },
          });
          assignedRoles++;
        }
      }

      return {
        message: 'Usuários e roles atribuídas com sucesso',
        createdOrFoundUsers: createdUsers,
        rolesAssigned: assignedRoles,
      };
    } catch (error) {
      return { message: 'Erro ao seed users', error: (error as Error).message };
    }
  }

  @Get('profiles')
  async seedProfiles() {
    try {
      const coordUser = await this.prisma.user.findUnique({
        where: { email: 'kobifi9638@hopesx.com' },
      });

      const advisorUser = await this.prisma.user.findUnique({
        where: { email: 'wedigony@fxzig.com' },
      });

      if (!coordUser || !advisorUser) {
        return {
          message:
            'Usuários necessários não encontrados. Rode /seed/users primeiro.',
        };
      }

      await this.prisma.coordinator.upsert({
        where: { userId: coordUser.id },
        update: {},
        create: {
          userId: coordUser.id,
          department: 'Ciência da Computação',
        },
      });

      const advisor = await this.prisma.advisor.upsert({
        where: { userId: advisorUser.id },
        update: {},
        create: {
          userId: advisorUser.id,
          specialty:
            'Inteligência Artificial e Processamento de Linguagem Natural',
          lattes: 'http://lattes.cnpq.br/1234567890123456',
        },
      });

      return {
        message: 'Perfis de coordinator e advisor criados/atualizados',
        advisorId: advisor.id,
      };
    } catch (error) {
      return {
        message: 'Erro ao seed profiles',
        error: (error as Error).message,
      };
    }
  }

  @Get('groups')
  async seedGroups() {
    try {
      const advisor = await this.prisma.advisor.findFirst(); // pega o primeiro advisor disponível

      if (!advisor) {
        return {
          message: 'Nenhum advisor encontrado. Rode /seed/profiles primeiro.',
        };
      }

      const group = await this.prisma.group.upsert({
        where: { id: 1 },
        update: {
          isPublished: true,
          publishedAt: new Date(),
        },
        create: {
          name: 'IA na Educação 2025.2',
          course: 'Engenharia de Software / Sistemas de Informação',
          advisorId: advisor.id,
          coAdvisorId: advisor.id,
          isPublished: true,
          publishedAt: new Date(),
        },
      });

      return {
        message: 'Grupo criado/atualizado',
        groupId: group.id,
        name: group.name,
      };
    } catch (error) {
      return {
        message: 'Erro ao seed groups',
        error: (error as Error).message,
      };
    }
  }

  @Get('students')
  async seedStudents() {
    try {
      const studentUser = await this.prisma.user.findUnique({
        where: { email: 'aluno.teste@exemplo.com' },
      });

      const group = await this.prisma.group.findFirst({
        where: { name: 'IA na Educação 2025.2' },
      });

      if (!studentUser) {
        return {
          message:
            'Usuário estudante não encontrado. Rode /seed/users primeiro.',
        };
      }
      if (!group) {
        return { message: 'Grupo não encontrado. Rode /seed/groups primeiro.' };
      }

      await this.prisma.student.upsert({
        where: { userId: studentUser.id },
        update: { groupId: group.id },
        create: {
          userId: studentUser.id,
          name: studentUser.name,
          email: studentUser.email,
          ra: '2023001234',
          course: 'Engenharia de Software',
          class: 'Noturno',
          phone: studentUser.phone || '(31) 91234-5678',
          birthDate: new Date('2003-05-15'),
          status: 'active',
          groupId: group.id,
        },
      });

      return { message: 'Estudante criado e vinculado ao grupo' };
    } catch (error) {
      return {
        message: 'Erro ao seed students',
        error: (error as Error).message,
      };
    }
  }

  @Get('indicators')
  async seedIndicators() {
    try {
      const indicadores = [
        { title: 'Nível máximo aceite de IA', value: 20, type: 'max' },
        {
          title: 'Nível mínimo de aderência às normas ABNT',
          value: 70,
          type: 'min',
        },
        {
          title: 'Nível mínimo de fundamentação teórica',
          value: 50,
          type: 'min',
        },
        { title: 'Originalidade (máx. similaridade)', value: 25, type: 'max' },
        { title: 'Qualidade da redação científica', value: 60, type: 'min' },
      ];

      let created = 0;
      for (const ind of indicadores) {
        const existing = await this.prisma.indicator.findUnique({
          where: { title: ind.title },
        });
        if (!existing) {
          await this.prisma.indicator.create({ data: ind });
          created++;
        }
      }

      return {
        message: 'Indicadores seed concluído',
        created,
        total: indicadores.length,
      };
    } catch (error) {
      return {
        message: 'Erro ao seed indicators',
        error: (error as Error).message,
      };
    }
  }

  @Get('submission')
  async seedSubmission() {
    try {
      await this.prisma.submission.upsert({
        where: { id: 1 },
        update: {},
        create: {
          stage: 1,
          status: 'active',
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      return { message: 'Submission de teste criada/atualizada' };
    } catch (error) {
      return {
        message: 'Erro ao seed submission',
        error: (error as Error).message,
      };
    }
  }
}
