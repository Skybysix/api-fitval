import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { TrainersService } from './trainers.service';
import { PhotosService } from './photos/photos.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { AuthGuard } from '../auth/auth.guard';
import { StaffGuard } from '../auth/staff.guard';

// Validaciones de la imagen
const photoPipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({
      maxSize: 2 * 1024 * 1024,
      message: 'La imagen no puede pasar de 2 MB',
    }),
    new FileTypeValidator({
      fileType: /^image\/(png|jpeg|webp)$/,
    }),
  ],
});

@Controller('trainers')
export class TrainersController {
  constructor(
    private readonly trainersService: TrainersService,
    private readonly photosService: PhotosService,
  ) {}

  // GET /api/v1/trainers/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trainersService.findOne(id);
  }

  // POST /api/v1/trainers (solo personal del gimnasio)
  @Post()
  @UseGuards(AuthGuard, StaffGuard)
  create(@Body() dto: CreateTrainerDto) {
    return this.trainersService.create(dto);
  }

  // POST /api/v1/trainers/:id/photo (subir foto del monitor)
  @Post(':id/photo')
  @UseGuards(AuthGuard, StaffGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(photoPipe) file: Express.Multer.File,
  ) {
    // Comprobamos que el monitor existe
    await this.trainersService.findOne(id);

    // Guardamos la imagen y obtenemos su URL
    const photoUrl = await this.photosService.saveLocal(file);

    // Guardamos la URL en la base de datos
    return this.trainersService.setPhoto(id, photoUrl);
  }
}
