import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsService } from './indicators.service';

@Module({
  controllers: [IndicatorsController],
  providers: [IndicatorsService, PrismaService],
  exports: [IndicatorsService],
})
export class IndicatorsModule {}
