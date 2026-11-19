import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// Comprobamos que los datos enviados para crear una clase sean válidos.
export class CreateClassDto {
  // Texto obligatorio entre 1 y 50 caracteres.
  // Quitamos los espacios del principio y del final.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  activity?: string;

  // Texto obligatorio entre 1 y 30 caracteres.
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  room?: string;

  // Debe ser una fecha válida en formato ISO.
  @IsDateString()
  startsAt?: string;

  // Debe ser un número entero mayor que 0.
  @IsInt()
  @Min(1)
  spots?: number;

  // Debe ser un número entero igual o mayor que 1.
  @IsInt()
  @Min(1)
  trainerId?: number;
}