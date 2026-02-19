import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/modules/email/email.module';
import { IndicatorsModule } from 'src/modules/indicators/indicators.module';
import { ReportsModule } from 'src/modules/reports/reports.module';
import { SubmissionsModule } from 'src/modules/submissions/submissions.module';
import { CloudinaryProvider } from 'src/providers/cloudinary.provider';
import { AuthModule } from '../auth/auth.module';
import { BulkUploadService } from './bulk-upload.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    ConfigModule,
    IndicatorsModule,
    SubmissionsModule,
    ReportsModule,
    EmailModule,
    AuthModule,
  ],
  controllers: [UploadController],
  providers: [UploadService, BulkUploadService, CloudinaryProvider],
  exports: [UploadService],
})
export class UploadModule {}
