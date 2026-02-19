import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PasswordUtil } from 'src/common/utils/password.util';
import { EmailQueueService } from 'src/modules/email/email-queue.service';
import { UserService } from 'src/modules/users/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthResponseDTO, LoginDTO } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
    private prisma: PrismaService,
  ) {}

  async login({ password, email }: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Credenciais inválidas. Verifique o email e a senha.',
      );
    }

    if (user) {
      console.log('Senha enviada no login:', JSON.stringify(password));
      console.log('Comprimento da senha no login:', password.length);
      console.log('Hash salvo no banco:', user.password);

      console.log('console login antes do compare', password, user.password);
      const isMatch = await PasswordUtil.compare(password, user.password);

      console.log('Resultado do compare:', isMatch);
      if (!isMatch)
        throw new UnauthorizedException(
          'Credenciais inválidas. Verifique o email e a senha.  000000002',
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

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.emailQueueService.sendPasswordResetEmail(
      user.email,
      user.name || user.name,
      resetLink,
      '60 minutos',
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    console.log('Nova senha recebida no reset:', JSON.stringify(newPassword));
    console.log('Comprimento da senha:', newPassword.length);
    try {
      const payload = this.jwtService.verify(token, {
        secret:
          this.configService.get<string>('JWT_RESET_SECRET') ||
          this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'password_reset') {
        throw new BadRequestException(
          'Token inválido para redefinição de senha',
        );
      }

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      await this.userService.update(user.id, { password: newPassword });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new BadRequestException('Link expirado. Solicite um novo.');
      }
      throw new BadRequestException('Token inválido ou expirado');
    }
  }

  async generateResetToken(userId: number): Promise<string> {
    const token = this.jwtService.sign(
      { sub: userId, type: 'reset_password' },
      { expiresIn: '1h' },
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    return token;
  }

  async validateResetToken(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'reset_password') return null;

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() },
        },
      });

      return user;
    } catch {
      return null;
    }
  }
}
