import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// Elimina los espacios del principio y del final.
function trimIfString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

// Datos necesarios para crear un monitor.
export class CreateTrainerDto {
  // DNI obligatorio, con un máximo de 9 caracteres.
  @Transform(({ value }) => trimIfString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(9)
  dni!: string;

  // Nombre obligatorio, con un máximo de 100 caracteres.
  @Transform(({ value }) => trimIfString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  // Correo obligatorio y válido.
  @Transform(({ value }) => trimIfString(value))
  @IsEmail()
  @MaxLength(150)
  email!: string;

  // Array obligatorio de IDs enteros positivos, sin duplicados.
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  specialties!: number[];
}
