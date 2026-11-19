import {Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';

@Controller('classes')
export class ClassesController {
  // Inyectamos el servicio que consulta las clases.
  constructor(private readonly classesService: ClassesService) {}

  // GET /api/classes
  // GET /api/classes?activity=yoga
  @Get()
  findAll(@Query('activity') activity?: string) {
    return this.classesService.findAll(activity);
  }

  // GET /api/classes/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }
    // POST /api/classes
  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }
}
