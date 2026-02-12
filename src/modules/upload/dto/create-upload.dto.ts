import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateUploadDto {
  @ApiProperty({
    description: 'ID do grupo ao qual o relatório pertence',
    example: 1,
  })
  @IsNumber({}, { message: 'groupId deve ser um número inteiro' })
  groupId: number;
}
