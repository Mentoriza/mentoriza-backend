import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class GenerateGroupsDto {
  @ApiProperty({
    description: 'Tamanho desejado de cada grupo (ex: 4, 5 ou 6)',
    example: 5,
  })
  @IsNumber()
  @Min(1)
  groupSize: number;

  @ApiProperty({
    description: 'Curso para o qual os grupos serão gerados',
    example: 'Engenharia de Software',
  })
  @IsString()
  course: string;
}
