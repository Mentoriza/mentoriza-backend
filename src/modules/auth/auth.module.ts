import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UserModule } from 'src/modules/users/user.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ConfigModule, UserModule, EmailModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
