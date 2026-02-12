import { ApiProperty } from '@nestjs/swagger';

export class SubmissionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-02-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2025-03-15T23:59:59.999Z' })
  endDate: Date;

  @ApiProperty({ enum: ['open', 'closed'], example: 'open' })
  status: string;

  @ApiProperty({ example: 1 })
  stage: number;

  @ApiProperty({ example: '2025-02-01T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-02-01T10:30:00.000Z' })
  updatedAt: Date;
}
