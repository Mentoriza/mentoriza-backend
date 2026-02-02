import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { IndicatorsModule } from 'src/indicators/indicators.module';
import { CloudinaryProvider } from 'src/providers/cloudinary.provider';
import { ReportsModule } from 'src/reports/reports.module';
import { SubmissionsModule } from 'src/submissions/submissions.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    ConfigModule,
    IndicatorsModule,
    SubmissionsModule,
    ReportsModule,
    EmailModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
  exports: [UploadService],
})
export class UploadModule {}
