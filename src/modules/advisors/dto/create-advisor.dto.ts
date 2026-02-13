import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateAdvisorDto {
  @ApiProperty({
    example: 'orientador.silva@example.com',
    description: 'Email do orientador (deve corresponder a um User existente)',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    example: 'Dr. Carlos Silva',
    description: 'Nome completo do orientador',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: 'Inteligência Artificial e Educação',
    description: 'Especialidade ou área de atuação',
    required: false,
  })
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiProperty({
    example: 'http://lattes.cnpq.br/1234567890123456',
    description: 'Link do currículo Lattes (opcional)',
    required: false,
  })
  @IsUrl({}, { message: 'URL do Lattes inválida' })
  @IsOptional()
  lattes?: string;

  @ApiProperty({
    example: '(244) 912-345678',
    description: 'Telefone de contato',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
