import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new submission' })
  @ApiResponse({ status: 201, description: 'Submission created.' })
  create(@Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a submission' })
  @ApiResponse({ status: 404, description: 'Submission not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubmissionDto,
  ) {
    return this.submissionsService.update(id, dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the currently active submission' })
  getActive() {
    return this.submissionsService.getActiveSubmission();
  }

  @Get()
  @ApiOperation({ summary: 'List all submissions' })
  findAll() {
    return this.submissionsService.findAll();
  }
}
