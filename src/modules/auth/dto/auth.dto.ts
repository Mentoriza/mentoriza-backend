import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthResponseDTO {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({
    example: { username: 'joao.silva', email: 'joao.silva@exemplo.com' },
  })
  user: {
    username: string;
    email: string;
  };

  @ApiProperty({
    example: '3600',
    description: 'Tempo de expiração em segundos ou string (ex: 1h)',
  })
  expiresIn: string | number;
}

export class LoginDTO {
  @ApiProperty({
    example: 'joao.silva@exemplo.com',
    description: 'Email do usuário (deve ser único no sistema)',
  })
  @IsEmail({}, { message: 'O email deve ser um endereço de email válido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @ApiProperty({
    example: 'senhaSegura123',
    description: 'Senha do usuário (mínimo 5 caracteres)',
  })
  @IsString({ message: 'A senha deve ser um texto válido.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(5, { message: 'A senha deve ter no mínimo 5 caracteres.' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'joao.silva@exemplo.com',
    description: 'Email cadastrado para receber o link de redefinição de senha',
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de redefinição recebido por email',
  })
  @IsString({ message: 'Token inválido' })
  @IsNotEmpty({ message: 'O token é obrigatório' })
  token: string;

  @ApiProperty({
    example: 'NovaSenhaForte2026!',
    description: 'Nova senha (mínimo 8 caracteres)',
  })
  @IsString({ message: 'A senha deve ser um texto válido' })
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  newPassword: string;
}
