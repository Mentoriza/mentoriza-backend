import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdvisorsModule } from './modules/advisors/advisors.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoordinatorsModule } from './modules/coordinators/coordinators.module';
import { EmailModule } from './modules/email/email.module';
import { GroupsModule } from './modules/groups/groups.module';
import { IndicatorsModule } from './modules/indicators/indicators.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SeedModule } from './modules/seed/seed.module';
import { StudentsModule } from './modules/students/students.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { UploadModule } from './modules/upload/upload.module';
import { UserModule } from './modules/users/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: process.env.REDIS_PUBLIC_URL,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        expiresIn: Number(
          configService.get<string>('JWT_EXPIRATION_TIME') ?? 3600,
        ),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UploadModule,
    IndicatorsModule,
    PrismaModule,
    SeedModule,
    SubmissionsModule,
    ReportsModule,
    EmailModule,
    UserModule,
    StudentsModule,
    CoordinatorsModule,
    AdvisorsModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
