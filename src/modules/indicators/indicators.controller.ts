import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { IndicatorsService } from './indicators.service';

@ApiTags('Indicators')
@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new indicator' })
  @ApiResponse({ status: 201, description: 'Indicator created.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  create(@Body() createIndicatorDto: CreateIndicatorDto) {
    return this.indicatorsService.create(createIndicatorDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all indicators' })
  findAll() {
    return this.indicatorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an indicator by ID' })
  @ApiResponse({ status: 404, description: 'Indicator not found.' })
  findOne(@Param('id') id: string) {
    return this.indicatorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an indicator' })
  @ApiResponse({ status: 404, description: 'Indicator not found.' })
  update(
    @Param('id') id: string,
    @Body() updateIndicatorDto: UpdateIndicatorDto,
  ) {
    return this.indicatorsService.update(+id, updateIndicatorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an indicator' })
  @ApiResponse({ status: 404, description: 'Indicator not found.' })
  remove(@Param('id') id: string) {
    return this.indicatorsService.remove(+id);
  }
}
