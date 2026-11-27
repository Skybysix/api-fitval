import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { TrainersController } from './trainers.controller';
import { TrainersService } from './trainers.service';
import { PhotosService } from './photos/photos.service';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [TrainersController],
  providers: [TrainersService, PhotosService],
})
export class TrainersModule {}
