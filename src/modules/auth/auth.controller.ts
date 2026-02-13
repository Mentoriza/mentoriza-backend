import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthResponseDTO,
  ForgotPasswordDto,
  LoginDTO,
  ResetPasswordDto,
} from './dto/auth.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDTO,
  })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  async login(@Body() loginData: LoginDTO): Promise<AuthResponseDTO> {
    return this.authService.login(loginData);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar redefinição de senha (envia email)' })
  @ApiResponse({
    status: 200,
    description:
      'Link de redefinição enviado (mensagem genérica por segurança)',
    schema: {
      example: {
        message: 'Se o email estiver cadastrado, você receberá um link.',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Erro na solicitação' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.email);
    return {
      message:
        'Se o email estiver cadastrado, você receberá um link de redefinição.',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha usando token recebido por email' })
  @ApiResponse({
    status: 200,
    description: 'Senha atualizada com sucesso',
    schema: { example: { message: 'Senha atualizada.' } },
  })
  @ApiBadRequestResponse({
    description: 'Token inválido, expirado ou dados incorretos',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Senha atualizada com sucesso. Faça login.' };
  }
}
