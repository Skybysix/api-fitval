import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsInt,
  IsString,
  Length,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

function trimIfString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateTrainerDto {
  @Transform(({ value }) => trimIfString(value))
  @IsString()
  @Length(9, 9)
  dni!: string;

  @Transform(({ value }) => trimIfString(value))
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @Transform(({ value }) => trimIfString(value))
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  specialtyIds!: number[];
}
