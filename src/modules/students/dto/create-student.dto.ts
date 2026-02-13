import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    example: 'joao.silva@example.com',
    description: 'Email do estudante (deve corresponder a um User existente)',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do estudante',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: '2023001234',
    description: 'Registro Acadêmico (RA) - opcional mas único',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(8, 12, { message: 'RA deve ter entre 8 e 12 caracteres' })
  ra?: string;

  @ApiProperty({
    example: 'Engenharia de Software',
    description: 'Curso do estudante',
    required: false,
  })
  @IsString()
  @IsOptional()
  course?: string;

  @ApiProperty({
    example: 'Noturno',
    description: 'Turma / Turno',
    required: false,
  })
  @IsString()
  @IsOptional()
  class?: string;

  @ApiProperty({
    example: '(244) 912-345678',
    description: 'Telefone de contato',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: '12345678900',
    description: 'CPF (sem pontos ou traços)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{11}$/, { message: 'CPF deve ter exatamente 11 dígitos' })
  cpf?: string;

  @ApiProperty({
    example: '2003-05-15',
    description: 'Data de nascimento (ISO format)',
    required: false,
  })
  @IsDateString({}, { message: 'Formato de data inválido' })
  @IsOptional()
  birthDate?: string;
}
