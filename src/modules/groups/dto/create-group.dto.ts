import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    example: 'Grupo IA Aplicada 2026.1',
    description: 'Nome do grupo',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({
    example: 'Engenharia de Software',
    description: 'Curso associado ao grupo',
  })
  @IsString()
  @IsNotEmpty({ message: 'Curso é obrigatório' })
  course: string;

  @ApiProperty({
    example: 1,
    description: 'ID do orientador principal (opcional no create)',
    required: false,
  })
  @IsInt({ message: 'ID do advisor deve ser inteiro' })
  @IsOptional()
  advisorId?: number;

  @ApiProperty({
    example: 2,
    description: 'ID do co-orientador (opcional no create)',
    required: false,
  })
  @IsInt({ message: 'ID do coAdvisor deve ser inteiro' })
  @IsOptional()
  coAdvisorId?: number;
}
