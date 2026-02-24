import { ApiProperty } from '@nestjs/swagger';
import { IndicatorKey } from '@prisma/client';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateIndicatorDto {
  @ApiProperty({
    description: 'Chave única do indicador (usada internamente)',
    enum: IndicatorKey,
    example: IndicatorKey.AI_PERCENTAGE,
  })
  @IsIn(Object.values(IndicatorKey))
  key: IndicatorKey;

  @ApiProperty({
    description: 'Título do indicador',
    example: 'Nível máximo de IA',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do indicador',
    example: 'Percentual máximo aceitável de conteúdo gerado por IA',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Valor percentual de referência',
    example: 20,
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Tipo: MIN (mínimo aceitável) ou MAX (máximo aceitável)',
    enum: ['MIN', 'MAX'],
    example: 'MAX',
  })
  @IsIn(['MIN', 'MAX'])
  type: 'MIN' | 'MAX';

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
