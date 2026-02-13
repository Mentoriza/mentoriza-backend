import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LinkUserDto } from 'src/common/dto/link-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { UpdateCoordinatorDto } from './dto/update-coordinator.dto';

@Injectable()
export class CoordinatorsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCoordinatorDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!existingUser) {
      throw new BadRequestException(
        'Não existe usuário com este email. Crie o usuário primeiro.',
      );
    }

    const existingCoordinator = await this.prisma.coordinator.findUnique({
      where: { userId: existingUser.id },
    });

    if (existingCoordinator) {
      throw new BadRequestException(
        'Este usuário já está registrado como coordenador.',
      );
    }

    return this.prisma.coordinator.create({
      data: {
        userId: existingUser.id,
        department: dto.department,
      },
      include: { user: true },
    });
  }

  async findAll() {
    return this.prisma.coordinator.findMany({
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
    const coordinator = await this.prisma.coordinator.findUnique({
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

    if (!coordinator) {
      throw new NotFoundException(`Coordenador com ID ${id} não encontrado`);
    }

    return coordinator;
  }

  async update(id: number, dto: UpdateCoordinatorDto) {
    await this.findOne(id);

    return this.prisma.coordinator.update({
      where: { id },
      data: {
        department: dto.department,
      },
      include: { user: true },
    });
  }

  async deactivate(id: number) {
    const coordinator = await this.findOne(id);

    await this.prisma.user.update({
      where: { id: coordinator.userId },
      data: { status: 'inactive' },
    });

    return { message: 'Coordenador desativado (usuário inativo)' };
  }

  async activate(id: number) {
    const coordinator = await this.findOne(id);

    await this.prisma.user.update({
      where: { id: coordinator.userId },
      data: { status: 'active' },
    });

    return { message: 'Coordenador ativado (usuário ativo)' };
  }

  async linkToUser(coordinatorId: number, dto: LinkUserDto) {
    const coordinator = await this.findOne(coordinatorId);

    if (coordinator.userId) {
      throw new BadRequestException(
        'Este coordenador já está vinculado a um usuário.',
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

    const existingCoordinatorWithUser =
      await this.prisma.coordinator.findUnique({
        where: { userId: user.id },
      });

    if (existingCoordinatorWithUser) {
      throw new BadRequestException(
        'Este usuário já está vinculado a outro coordenador.',
      );
    }

    return this.prisma.coordinator.update({
      where: { id: coordinatorId },
      data: { userId: user.id },
      include: { user: true },
    });
  }

  async unlinkFromUser(coordinatorId: number) {
    await this.findOne(coordinatorId);

    // return this.prisma.coordinator.update({
    //   where: { id: coordinatorId },
    //   data: { userId: null },
    //   include: { user: true },
    // });
  }

  async getCoordinatorUser(coordinatorId: number) {
    const coordinator = await this.prisma.coordinator.findUnique({
      where: { id: coordinatorId },
      include: { user: true },
    });

    if (!coordinator) throw new NotFoundException('Coordenador não encontrado');

    return coordinator.user;
  }
}
