import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentStatus } from '@prisma/client';
import { USER_STATUS } from 'src/common/constants';
import { LinkUserDto } from 'src/common/dto/link-user.dto';
import { PasswordUtil } from 'src/common/utils/password.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailQueueService } from '../email/email-queue.service';
import { UserService } from '../users/user.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { LinkGroupDto } from './dto/link-group.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    private prisma: PrismaService,
    private emailQueueService: EmailQueueService,
    private userService: UserService,
  ) {}

  async create(dto: CreateStudentDto) {
    return this.prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        const password = PasswordUtil.generateSecurePassword(16);
        const hashedPassword = await PasswordUtil.hash(password);

        user = await tx.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            name: dto.name || dto.email.split('@')[0],
            phone: dto.phone,
            status: USER_STATUS.ACTIVE,
          },
        });
      }

      const existingStudent = await tx.student.findUnique({
        where: { userId: user.id },
      });

      if (existingStudent) {
        throw new BadRequestException(
          'Este usuário já está registrado como estudante.',
        );
      }

      if (dto.ra) {
        const existingRa = await tx.student.findUnique({
          where: { ra: dto.ra },
        });
        if (existingRa) {
          throw new BadRequestException('Já existe um estudante com este RA.');
        }
      }

      return tx.student.create({
        data: {
          userId: user.id,
          ra: dto.ra,
          course: dto.course,
          class: dto.class,
          phone: dto.phone,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          status: StudentStatus.active,
        },
        include: { user: true, group: true },
      });
    });
  }

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: { select: { id: true, email: true, name: true, status: true } },
        group: { select: { id: true, name: true, course: true } },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
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
        ra: dto.ra,
        course: dto.course,
        class: dto.class,
        phone: dto.phone,
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

  async remove_a(id: number) {
    const student = await this.findOne(id);

    if (!student) {
      throw new NotFoundException('Estudante não encontrado no sistema');
    }

    if (student.status === StudentStatus.active) {
      throw new BadRequestException(
        'Não é possível excluir aluno ativo. Desative primeiro.',
      );
    }

    return this.prisma.student.delete({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true } },
        group: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: number, deleteUserAlso = false) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Estudante ${id} não encontrado`);
    }

    if (deleteUserAlso) {
      const userRolesCount = await this.prisma.user.count({
        where: {
          id: student.userId,
        },
      });

      if (userRolesCount > 1) {
        throw new BadRequestException(
          'Não é possível excluir o usuário: ele possui outros papéis no sistema.',
        );
      }

      await this.prisma.student.delete({ where: { id } });

      await this.prisma.user.delete({ where: { id: student.userId } });

      return {
        deletedStudentId: id,
        deletedUserId: student.userId,
        email: student.user.email,
        message: 'Estudante e usuário excluídos com sucesso',
      };
    }

    return this.prisma.student.delete({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });
  }
}
