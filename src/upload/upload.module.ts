import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndicatorsModule } from 'src/indicators/indicators.module';
import { CloudinaryProvider } from 'src/providers/cloudinary.provider';
import { SubmissionsModule } from 'src/submissions/submissions.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [ConfigModule, IndicatorsModule, SubmissionsModule],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
  exports: [UploadService],
})
export class UploadModule {}
