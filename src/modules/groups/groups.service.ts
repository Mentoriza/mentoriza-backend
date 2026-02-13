import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailQueueService } from '../email/email-queue.service';
import { StudentsService } from '../students/students.service';
import { CreateGroupDto } from './dto/create-group.dto';
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
        students: { select: { id: true, name: true, ra: true } },
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
    await this.findOne(id);

    return this.prisma.group.delete({
      where: { id },
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
      throw new BadRequestException(
        'Este estudante já está vinculado a outro grupo',
      );
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

    if (!group.advisorId) {
      throw new BadRequestException(
        'Este grupo não tem Co-orientador vinculado',
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
}
