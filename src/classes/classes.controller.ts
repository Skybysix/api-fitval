import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Delete,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { AuthGuard } from '../auth/auth.guard';
import { StaffGuard } from '../auth/staff.guard';
import { FindClassesQueryDto } from './dto/find-classes-query.dto';

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
  // GET /api/v2/classes
  @Get()
  @Version('2')
  findPage(@Query() queryDto: FindClassesQueryDto) {
    return this.classesService.findPage(queryDto);
  }

  // GET /api/classes/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }
  // POST /api/classes
  @Post()
  @UseGuards(AuthGuard, StaffGuard)
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }
  // DELETE /api/classes/:id
  @Delete(':id')
  @UseGuards(AuthGuard, StaffGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }
}
