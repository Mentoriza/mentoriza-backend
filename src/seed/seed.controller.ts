import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seed')
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async runSeed() {
    try {
      console.log(' Iniciando seed via API...');

      const indicadores = [
        {
          title: 'Nível máximo aceite de IA',
          value: 20,
          type: 'max',
        },
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
      ];

      let createdCount = 0;

      for (const ind of indicadores) {
        const existing = await this.prisma.indicator.findUnique({
          where: { title: ind.title },
        });

        if (!existing) {
          await this.prisma.indicator.create({ data: ind });
          createdCount++;
          console.log(`Criado: ${ind.title} (${ind.value}%)`);
        } else {
          console.log(`Já existe: ${ind.title}`);
        }
      }

      return {
        message: 'Seed executado com sucesso!',
        created: createdCount,
        totalProcessed: indicadores.length,
      };
    } catch (error) {
      console.error('Erro no seed via API:', error);
      return {
        message: 'Erro ao executar seed',
        error: error.message,
      };
    }
  }
}
