import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compareSync } from 'bcrypt';
import { EmailQueueService } from 'src/modules/email/email-queue.service';
import { UserService } from 'src/modules/users/user.service';
import { AuthResponseDTO, LoginDTO } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async login({ password, email }: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userService.findByEmail(email);
    if (!user || !compareSync(password, user.password)) {
      throw new UnauthorizedException(
        'Credenciais inválidas. Verifique o email e a senha.',
      );
    }

    const payload = { email: user.email, sub: user.id };

    const expiresInStr =
      this.configService.get<string>('JWT_EXPIRATION_TIME') ?? '1h';

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: expiresInStr as any,
    });

    return {
      user: {
        username: user.name ?? user.name ?? 'Usuário',
        email: user.email,
      },
      token,
      expiresIn: expiresInStr,
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(
        'Este usuário nao existe crie uma conta ou verifica o email',
      );
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password_reset' },
      {
        secret:
          this.configService.get<string>('JWT_RESET_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
        expiresIn:
          this.configService.get<string>('JWT_RESET_EXPIRATION') ||
          ('60m' as any),
      },
    );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailQueueService.sendPasswordResetEmail(
      user.email,
      user.name || user.name,
      resetLink,
      '60 minutos',
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    console.log('chegou', token);
    try {
      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_RESET_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
      });

      console.log(payload);

      if (payload.type !== 'password_reset') {
        throw new BadRequestException(
          'Token inválido para redefinição de senha',
        );
      }

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      const hashedPassword = await this.userService.hashPassword(newPassword);
      console.log('hashedPassword', hashedPassword);
      await this.userService.update(user.id, { password: hashedPassword });
    } catch (err) {
      console.log(err);
      if (err.name === 'TokenExpiredError') {
        throw new BadRequestException('Link expirado. Solicite um novo.');
      }
      throw new BadRequestException('Token inválido ou expirado');
    }
  }
}
