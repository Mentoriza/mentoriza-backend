import { IndicatorKey, IndicatorType, PrismaClient } from '@prisma/client';
import 'dotenv/config';
console.log(process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function main() {
  await prisma.indicator.createMany({
    data: [
      {
        key: IndicatorKey.ABNT_VALIDATION,
        title: 'Conformidade com Normas ABNT',
        description:
          'Valida formatação (fontes, espaçamentos, margens) via análise direta do PDF.',
        type: IndicatorType.MIN,
        value: 70,
        isActive: true,
      },
      {
        key: IndicatorKey.AI_PERCENTAGE,
        title: 'Percentagem de Conteúdo Gerado por IA',
        description:
          'Analisa texto via IA para detectar conteúdo gerado por ferramentas como GPT.',
        type: IndicatorType.MAX,
        value: 20,
        isActive: true,
      },
      {
        key: IndicatorKey.THEORETICAL_FOUNDATION,
        title: 'Fundamentação Teórica',
        description:
          'Avalia profundidade e qualidade da base teórica no conteúdo via IA.',
        type: IndicatorType.MIN,
        value: 80,
        isActive: true,
      },
      {
        key: IndicatorKey.PROBLEM_STATEMENT,
        title: 'Validação da Problemática',
        description:
          'Avalia clareza, relevância e delimitação do problema de pesquisa.',
        type: IndicatorType.MIN,
        value: 75,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => {
    console.log('Seed executado com sucesso');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
