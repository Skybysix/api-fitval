import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';

@Module({
  // Importamos DatabaseModule para poder utilizar la conexión PostgreSQL.
  imports: [DatabaseModule, UsersModule],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
