import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdvisorsController } from './advisors.controller';
import { AdvisorsService } from './advisors.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdvisorsController],
  providers: [AdvisorsService],
  exports: [AdvisorsService],
})
export class AdvisorsModule {}
