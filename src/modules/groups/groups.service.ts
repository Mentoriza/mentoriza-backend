import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailQueueService } from '../email/email-queue.service';
import { StudentsService } from '../students/students.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { GenerateGroupsDto } from './dto/generate-groups.dto';
import { LinkAdvisorDto } from './dto/link-advisor.dto';
import { LinkStudentDto } from './dto/link-student.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private studentsService: StudentsService,
    private emailQueueService: EmailQueueService,
  ) {}

  async create(dto: CreateGroupDto) {
    const advisorExists = dto.advisorId
      ? await this.prisma.advisor.findUnique({ where: { id: dto.advisorId } })
      : null;
    const coAdvisorExists = dto.coAdvisorId
      ? await this.prisma.advisor.findUnique({ where: { id: dto.coAdvisorId } })
      : null;

    if (dto.advisorId && !advisorExists) {
      throw new NotFoundException(
        `Orientador com ID ${dto.advisorId} não encontrado`,
      );
    }
    if (dto.coAdvisorId && !coAdvisorExists) {
      throw new NotFoundException(
        `Co-orientador com ID ${dto.coAdvisorId} não encontrado`,
      );
    }

    return this.prisma.group.create({
      data: {
        name: dto.name,
        course: dto.course,
        advisorId: dto.advisorId,
        coAdvisorId: dto.coAdvisorId,
        isPublished: false,
      },
      include: {
        advisor: true,
        coAdvisor: true,
        students: true,
      },
    });
  }

  async findAll() {
    return this.prisma.group.findMany({
      include: {
        advisor: {
          select: {
            id: true,
            specialty: true,
            user: { select: { name: true } },
          },
        },
        coAdvisor: {
          select: {
            id: true,
            specialty: true,
            user: { select: { name: true } },
          },
        },
        students: { select: { id: true, user: true, ra: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        advisor: { include: { user: true } },
        coAdvisor: { include: { user: true } },
        students: { include: { user: true } },
        reports: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
    }

    return group;
  }

  async update(id: number, dto: UpdateGroupDto) {
    await this.findOne(id);

    return this.prisma.group.update({
      where: { id },
      data: {
        name: dto.name,
        course: dto.course,
        advisorId: dto.advisorId,
        coAdvisorId: dto.coAdvisorId,
      },
      include: {
        advisor: true,
        coAdvisor: true,
        students: true,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!group) {
        throw new NotFoundException(`Grupo com ID ${id} não encontrado`);
      }

      await tx.student.updateMany({
        where: { groupId: id },
        data: { groupId: null },
      });

      await tx.group.delete({
        where: { id },
      });

      return {
        message: `Grupo "${group.name}" deletado com sucesso e estudantes liberados.`,
      };
    });
  }

  async publish(id: number) {
    await this.findOne(id);

    return this.prisma.group.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  async unpublish(id: number) {
    await this.findOne(id);

    return this.prisma.group.update({
      where: { id },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    });
  }

  async linkStudent(groupId: number, dto: LinkStudentDto) {
    const group = await this.findOne(groupId);

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException(
        `Estudante com ID ${dto.studentId} não encontrado`,
      );
    }

    if (student.groupId) {
      await this.prisma.student.update({
        where: { id: dto.studentId },
        data: { groupId },
      });
    }

    return this.prisma.student.update({
      where: { id: dto.studentId },
      data: { groupId },
      include: { group: true },
    });
  }

  async unlinkStudent(groupId: number, studentId: number) {
    const group = await this.findOne(groupId);

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.groupId !== groupId) {
      throw new BadRequestException(
        'Este estudante não está vinculado a este grupo',
      );
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: { groupId: null },
    });
  }

  async linkAdvisor(groupId: number, dto: LinkAdvisorDto) {
    const group = await this.findOne(groupId);

    const advisor = await this.prisma.advisor.findUnique({
      where: { id: dto.advisorId },
      include: {
        user: true,
      },
    });

    if (!advisor || !advisor.user) {
      throw new NotFoundException(
        `Orientador com ID ${dto.advisorId} não encontrado ou sem usuário vinculado`,
      );
    }

    await this.emailQueueService.sendAdvisorGroupAssignedEmail({
      advisorName: advisor.user.name || 'Orientador',
      groupName: group.name,
      email: advisor.user.email,
      isCoAdvisor: false,
      course: group.course,
    });

    return this.prisma.group.update({
      where: { id: groupId },
      data: { advisorId: dto.advisorId },
      include: { advisor: { include: { user: true } } },
    });
  }

  async linkCoAdvisor(groupId: number, dto: LinkAdvisorDto) {
    const group = await this.findOne(groupId);

    const coAdvisor = await this.prisma.advisor.findUnique({
      where: { id: dto.advisorId },
      include: {
        user: true,
      },
    });

    if (!coAdvisor || !coAdvisor.user) {
      throw new NotFoundException(
        `Co-orientador com ID ${dto.advisorId} não encontrado ou sem usuário vinculado`,
      );
    }

    await this.emailQueueService.sendAdvisorGroupAssignedEmail({
      advisorName: coAdvisor.user.name || 'Co-orientador',
      groupName: group.name,
      email: coAdvisor.user.email,
      isCoAdvisor: true,
      course: group.course,
    });

    return this.prisma.group.update({
      where: { id: groupId },
      data: { coAdvisorId: dto.advisorId },
      include: { coAdvisor: { include: { user: true } } },
    });
  }

  async unlinkAdvisor(groupId: number) {
    const group = await this.findOne(groupId);

    if (!group.advisorId) {
      throw new BadRequestException(
        'Este grupo não tem orientador principal vinculado',
      );
    }

    const advisor = await this.prisma.advisor.findUnique({
      where: { id: group.advisorId },
      include: { user: true },
    });

    if (!advisor || !advisor.user) {
      throw new NotFoundException('Orientador não encontrado ou sem usuário');
    }

    await this.emailQueueService.sendAdvisorGroupRemovedEmail({
      advisorName: advisor.user.name || 'Orientador',
      groupName: group.name,
      email: advisor.user.email,
      isCoAdvisor: false,
    });

    return this.prisma.group.update({
      where: { id: groupId },
      data: { advisorId: null },
      include: { advisor: { include: { user: true } } },
    });
  }

  async unlinkCoAdvisor(groupId: number) {
    const group = await this.findOne(groupId);

    if (!group.coAdvisorId) {
      throw new BadRequestException(
        'Este grupo não tem co-orientador vinculado',
      );
    }

    const coAdvisor = await this.prisma.advisor.findUnique({
      where: { id: group.coAdvisorId },
      include: { user: true },
    });

    if (!coAdvisor || !coAdvisor.user) {
      throw new NotFoundException(
        'Co-orientador não encontrado ou sem usuário',
      );
    }

    await this.emailQueueService.sendAdvisorGroupRemovedEmail({
      advisorName: coAdvisor.user.name || 'Co-orientador',
      groupName: group.name,
      email: coAdvisor.user.email,
      isCoAdvisor: true,
    });

    return this.prisma.group.update({
      where: { id: groupId },
      data: { coAdvisorId: null },
    });
  }

  async getGroupStudents(groupId: number) {
    const group = await this.findOne(groupId);

    return group.students;
  }

  async addStudentToGroup(groupId: number, studentId: number) {
    const group = await this.findOne(groupId);

    if (!group) {
      throw new NotFoundException(`Grupo com ID ${groupId} não encontrado`);
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) throw new NotFoundException('Estudante não encontrado');

    // Chama o método do StudentsService para garantir a regra + email
    return this.studentsService.changeGroup(studentId, groupId);
  }

  async generateGroups(dto: GenerateGroupsDto) {
    const students = await this.prisma.student.findMany({
      where: {
        groupId: null,
        course: dto.course,
        status: 'active',
        deletedAt: null,
      },
      select: { id: true },
    });

    if (students.length === 0) {
      throw new BadRequestException(
        'Não há estudantes sem grupo disponíveis para este curso',
      );
    }

    const advisors = await this.prisma.advisor.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    if (advisors.length === 0) {
      throw new BadRequestException('Não há orientadores disponíveis');
    }

    const studentIds = students
      .map((s) => s.id)
      .sort(() => Math.random() - 0.5);

    const numGroups = Math.ceil(studentIds.length / dto.groupSize);

    const groupsData = Array.from({ length: numGroups }, (_, i) => ({
      name: `Grupo ${i + 1}`,
      course: dto.course,
      advisorId: advisors[Math.floor(Math.random() * advisors.length)].id,
      isPublished: false,
    }));

    let createdGroups: Array<{
      id: number;
      name: string;
      course: string;
      advisorId: number | null;
      isPublished: boolean;
    }> = [];

    await this.prisma.$transaction(
      async (tx) => {
        await tx.group.createMany({
          data: groupsData,
          skipDuplicates: true,
        });

        createdGroups = await tx.group.findMany({
          where: {
            course: dto.course,
            name: { in: groupsData.map((g) => g.name) },
          },
          orderBy: { createdAt: 'desc' },
          take: numGroups,
          select: {
            id: true,
            name: true,
            course: true,
            advisorId: true,
            isPublished: true,
          },
        });

        if (createdGroups.length !== numGroups) {
          throw new Error('Não foi possível criar todos os grupos esperados');
        }

        let studentIndex = 0;
        for (let i = 0; i < numGroups; i++) {
          const groupId = createdGroups[i].id;
          const currentGroupSize = Math.min(
            dto.groupSize,
            studentIds.length - studentIndex,
          );

          if (currentGroupSize === 0) continue;

          const batchStudentIds = studentIds.slice(
            studentIndex,
            studentIndex + currentGroupSize,
          );

          await tx.student.updateMany({
            where: { id: { in: batchStudentIds } },
            data: { groupId },
          });

          studentIndex += currentGroupSize;
        }
      },
      { timeout: 120000 },
    );

    const finalGroups = await this.prisma.group.findMany({
      where: { id: { in: createdGroups.map((g) => g.id) } },
      include: {
        advisor: { select: { id: true, user: { select: { name: true } } } },
        students: {
          select: { id: true, ra: true, user: { select: { name: true } } },
        },
      },
    });

    return finalGroups;
  }
}
