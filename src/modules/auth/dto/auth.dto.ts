import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthResponseDTO {
  token: string;

  user: {
    username: string;
    email: string;
  };

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
