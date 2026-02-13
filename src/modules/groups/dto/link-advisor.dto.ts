import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class LinkAdvisorDto {
  @ApiProperty({
    example: 1,
    description: 'ID do orientador a ser vinculado ao grupo',
  })
  @IsInt({ message: 'ID do advisor deve ser inteiro' })
  @IsNotEmpty({ message: 'ID do advisor é obrigatório' })
  advisorId: number;
}
