import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';

@Injectable()
export class IndicatorsService {
  constructor(private prisma: PrismaService) {}

  async create(createIndicatorDto: CreateIndicatorDto) {
    return this.prisma.indicator.create({
      data: createIndicatorDto,
    });
  }

  async findAll() {
    return this.prisma.indicator.findMany();
  }

  async findOne(id: number) {
    const indicator = await this.prisma.indicator.findUnique({ where: { id } });
    if (!indicator) {
      throw new NotFoundException(`Indicator com ID ${id} não encontrado`);
    }
    return indicator;
  }

  async update(id: number, updateIndicatorDto: UpdateIndicatorDto) {
    return this.prisma.indicator.update({
      where: { id },
      data: updateIndicatorDto,
    });
  }

  async remove(id: number) {
    return this.prisma.indicator.delete({ where: { id } });
  }

  async findAllActive() {
    return this.prisma.indicator.findMany({
      where: { isActive: true },
    });
  }
}
