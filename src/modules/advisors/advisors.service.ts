import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LinkUserDto } from 'src/common/dto/link-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdvisorDto } from './dto/create-advisor.dto';
import { UpdateAdvisorDto } from './dto/update-advisor.dto';

@Injectable()
export class AdvisorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdvisorDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!existingUser) {
      throw new BadRequestException(
        'Não existe usuário com este email. Crie o usuário primeiro.',
      );
    }

    const existingAdvisor = await this.prisma.advisor.findUnique({
      where: { userId: existingUser.id },
    });

    if (existingAdvisor) {
      throw new BadRequestException(
        'Este usuário já está registrado como orientador.',
      );
    }

    return this.prisma.advisor.create({
      data: {
        userId: existingUser.id,
        specialty: dto.specialty,
        lattes: dto.lattes,
      },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prisma.advisor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            status: true,
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });
  }

  async findOne(id: number) {
    const advisor = await this.prisma.advisor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    if (!advisor) {
      throw new NotFoundException(`Orientador com ID ${id} não encontrado`);
    }

    return advisor;
  }

  async update(id: number, dto: UpdateAdvisorDto) {
    await this.findOne(id);

    return this.prisma.advisor.update({
      where: { id },
      data: {
        specialty: dto.specialty,
        lattes: dto.lattes,
      },
      include: { user: true },
    });
  }

  async deactivate(id: number) {
    const advisor = await this.findOne(id);

    await this.prisma.user.update({
      where: { id: advisor.userId },
      data: { status: 'inactive' },
    });

    return { message: 'Orientador desativado (usuário inativo)' };
  }

  async activate(id: number) {
    const advisor = await this.findOne(id);

    await this.prisma.user.update({
      where: { id: advisor.userId },
      data: { status: 'active' },
    });

    return { message: 'Orientador ativado (usuário ativo)' };
  }

  async linkToUser(advisorId: number, dto: LinkUserDto) {
    const advisor = await this.findOne(advisorId);

    if (advisor.userId) {
      throw new BadRequestException(
        'Este orientador já está vinculado a um usuário.',
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

    const existingAdvisorWithUser = await this.prisma.advisor.findUnique({
      where: { userId: user.id },
    });

    if (existingAdvisorWithUser) {
      throw new BadRequestException(
        'Este usuário já está vinculado a outro orientador.',
      );
    }

    return this.prisma.advisor.update({
      where: { id: advisorId },
      data: { userId: user.id },
      include: { user: true },
    });
  }

  async unlinkFromUser(advisorId: number) {
    await this.findOne(advisorId);

    // return this.prisma.advisor.update({
    //   where: { id: advisorId },
    //   data: { userId: null },
    //   include: { user: true },
    // });
  }

  async getAdvisorUser(advisorId: number) {
    const advisor = await this.prisma.advisor.findUnique({
      where: { id: advisorId },
      include: { user: true },
    });

    if (!advisor) throw new NotFoundException('Orientador não encontrado');

    return advisor.user;
  }

  async getAdvisedGroups(advisorId: number) {
    const advisor = await this.prisma.advisor.findUnique({
      where: { id: advisorId },
      include: {
        advisedGroups: true,
        coAdvisedGroups: true,
      },
    });

    if (!advisor) throw new NotFoundException('Orientador não encontrado');

    return {
      advised: advisor.advisedGroups,
      coAdvised: advisor.coAdvisedGroups,
    };
  }
}
