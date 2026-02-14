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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDTO,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body() loginData: LoginDTO): Promise<AuthResponseDTO> {
    return this.authService.login(loginData);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset (sends email)' })
  @ApiResponse({
    status: 200,
    description:
      'Password reset link sent (generic message for security reasons)',
    schema: {
      example: {
        message: 'If the email is registered, you will receive a reset link.',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Request error' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto.email);
    return {
      message:
        'If the email is registered, you will receive a password reset link.',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using the token received by email' })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: { example: { message: 'Password updated.' } },
  })
  @ApiBadRequestResponse({
    description: 'Invalid, expired token or incorrect data',
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password updated successfully. Please log in.' };
  }
}
