import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  async create(@Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubmissionDto,
  ) {
    return this.submissionsService.update(id, dto);
  }
  @Get('active')
  async getActive() {
    return this.submissionsService.getActiveSubmission();
  }

  @Get()
  async findAll() {
    return this.submissionsService.findAll();
  }
}
