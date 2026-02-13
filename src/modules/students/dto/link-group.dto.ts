import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class LinkGroupDto {
  @ApiProperty({
    example: 5,
    description: 'ID do grupo ao qual o estudante será vinculado',
  })
  @IsInt({ message: 'ID do grupo deve ser um número inteiro' })
  @IsNotEmpty({ message: 'ID do grupo é obrigatório' })
  groupId: number;
}
