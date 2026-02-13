import { ApiProperty } from '@nestjs/swagger';

export class UnlinkGroupDto {
  @ApiProperty({
    example: 'Motivo opcional para desvinculação',
    required: false,
  })
  reason?: string;
}
