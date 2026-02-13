import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentStatus } from '@prisma/client';
import { LinkUserDto } from 'src/common/dto/link-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailQueueService } from '../email/email-queue.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { LinkGroupDto } from './dto/link-group.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private emailQueueService: EmailQueueService,
  ) {}

  async create(dto: CreateStudentDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!existingUser) {
      throw new BadRequestException(
        'Não existe usuário com este email. Crie o usuário primeiro.',
      );
    }

    const existingStudent = await this.prisma.student.findUnique({
      where: { userId: existingUser.id },
    });

    if (existingStudent) {
      throw new BadRequestException(
        'Este usuário já está registrado como estudante.',
      );
    }

    return this.prisma.student.create({
      data: {
        userId: existingUser.id,
        name: dto.name,
        email: dto.email,
        ra: dto.ra,
        course: dto.course,
        class: dto.class,
        phone: dto.phone,
        cpf: dto.cpf,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        status: StudentStatus.active,
      },
      include: { user: true, group: true },
    });
  }

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: { select: { id: true, email: true, name: true, status: true } },
        group: { select: { id: true, name: true, course: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, phone: true } },
        group: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Estudante com ID ${id} não encontrado`);
    }

    return student;
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.findOne(id);

    return this.prisma.student.update({
      where: { id },
      data: {
        name: dto.name,
        ra: dto.ra,
        course: dto.course,
        class: dto.class,
        phone: dto.phone,
        cpf: dto.cpf,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
      include: { group: true },
    });
  }

  async deactivate(id: number) {
    await this.findOne(id);

    return this.prisma.student.update({
      where: { id },
      data: { status: StudentStatus.inactive },
    });
  }

  async activate(id: number) {
    await this.findOne(id);

    return this.prisma.student.update({
      where: { id },
      data: { status: StudentStatus.active },
    });
  }

  async linkToGroup(studentId: number, dto: LinkGroupDto) {
    const student = await this.findOne(studentId);

    if (!student) return;

    const groupExists = await this.prisma.group.findUnique({
      where: { id: dto.groupId },
    });

    if (!groupExists) {
      throw new NotFoundException(`Grupo com ID ${dto.groupId} não encontrado`);
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: { groupId: dto.groupId },
      include: { group: true },
    });
  }

  async unlinkFromGroup(studentId: number) {
    await this.findOne(studentId);

    return this.prisma.student.update({
      where: { id: studentId },
      data: { groupId: null },
      include: { group: true },
    });
  }

  async getStudentGroup(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { group: true },
    });

    if (!student) throw new NotFoundException('Estudante não encontrado');

    return student.group;
  }

  async getStudentUser(studentId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) throw new NotFoundException('Estudante não encontrado');

    return student.user;
  }

  async linkToUser(studentId: number, dto: LinkUserDto) {
    const student = await this.findOne(studentId);

    if (student.userId) {
      throw new BadRequestException(
        'Este estudante já está vinculado a um usuário.',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuário com email ${dto.email} não encontrado.`,
      );
    }

    const existingStudentWithUser = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });

    if (existingStudentWithUser) {
      throw new BadRequestException(
        'Este usuário já está vinculado a outro estudante.',
      );
    }

    return this.prisma.student.update({
      where: { id: studentId },
      data: { userId: user.id },
      include: { user: true },
    });
  }

  async unlinkFromUser(studentId: number) {
    const student = await this.findOne(studentId);

    if (!student.userId) {
      throw new BadRequestException(
        'Este estudante não está vinculado a nenhum usuário.',
      );
    }

    // return this.prisma.student.update({
    //   where: { id: studentId },
    //   data: { userId: null },
    //   include: { user: true },
    // });
  }

  async changeGroup(studentId: number, groupId: number) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { group: true, user: true },
    });

    if (!student) {
      throw new NotFoundException('Estudante não encontrado');
    }

    const newGroup = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!newGroup) {
      throw new NotFoundException('Grupo não encontrado');
    }

    if (student.groupId === groupId) {
      return student;
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id: studentId },
      data: { groupId },
      include: { group: true, user: true },
    });

    if (groupId) {
      await this.emailQueueService.sendStudentGroupChangedEmail({
        studentName: student.user.name,
        oldGroupName: student.group?.name ?? '',
        newGroupName: newGroup.name,
        email: student.user.email,
        course: newGroup.course,
      });
    } else {
      await this.emailQueueService.sendStudentGroupAssignedEmail({
        studentName: student.user.name,
        groupName: newGroup.name,
        email: student.user.email,
        course: newGroup.course,
      });
    }

    return updatedStudent;
  }
}
