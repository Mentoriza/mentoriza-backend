import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'Data de término da submissão (formato ISO 8601)',
    example: '2025-03-15T23:59:59.999Z',
    type: String,
  })
  @IsDateString(
    {},
    { message: 'endDate deve ser uma data válida no formato ISO 8601' },
  )
  endDate: string;

  @ApiProperty({
    description: 'Número da fase/etapa da submissão',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'stage deve ser um número inteiro' })
  @Min(1, { message: 'stage deve ser maior ou igual a 1' })
  stage: number;
}
