import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCoordinatorDto {
  @ApiProperty({
    example: 'coordenador.silva@example.com',
    description: 'Email do coordenador (deve corresponder a um User existente)',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo do coordenador',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: 'Engenharia de Software',
    description: 'Departamento ou área de coordenação',
    required: false,
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    example: '(244) 912-345678',
    description: 'Telefone de contato',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
