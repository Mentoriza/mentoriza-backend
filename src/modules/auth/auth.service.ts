import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/users/user.service';
import { AuthResponseDTO, LoginDTO } from './dto/auth.dto';

import { ConfigService } from '@nestjs/config';
import { compareSync } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login({ password, email }: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userService.findByEmail(email);
    if (!user || !compareSync(password, user.password)) {
      throw new UnauthorizedException(
        'Credenciais inválidas. Verifique o email e a senha.',
      );
    }
    const payload = { email: user.email, sub: user.id };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: Number(
        this.configService.get<string>('JWT_EXPIRATION_TIME') ?? 3600,
      ),
    });
    return {
      user: {
        username: user.name,
        email: user.email,
      },
      token,
      expiresIn: Number(
        this.configService.get<string>('JWT_EXPIRATION_TIME') ?? 3600,
      ),
    };
  }
}
