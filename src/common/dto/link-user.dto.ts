import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LinkUserDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description:
      'Email do usuário a ser vinculado ao perfil (estudante, orientador, coordenador)',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;
}
