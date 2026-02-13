import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class LinkStudentDto {
  @ApiProperty({
    example: 3,
    description: 'ID do estudante a ser vinculado ao grupo',
  })
  @IsInt({ message: 'ID do estudante deve ser inteiro' })
  @IsNotEmpty({ message: 'ID do estudante é obrigatório' })
  studentId: number;
}
