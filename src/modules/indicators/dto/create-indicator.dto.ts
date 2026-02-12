import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsString } from 'class-validator';

export class CreateIndicatorDto {
  @ApiProperty({
    description: 'Título do indicador',
    example: 'Nível máximo de IA',
  })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Valor percentual', example: 20 })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Tipo: min ou max',
    example: 'max',
    enum: ['min', 'max'],
  })
  @IsIn(['min', 'max'])
  type: 'min' | 'max';
}
