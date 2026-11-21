import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListClassesQueryDto {
  // Número de página (por defecto 1)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  // Clases por página (por defecto 10, máximo 50)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  // Campo por el que ordenar
  @IsOptional()
  @IsIn(['startsAt', 'activity', 'spots'])
  sort: 'startsAt' | 'activity' | 'spots' = 'startsAt';

  // Orden ascendente o descendente
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: string = 'asc';

  // Filtro opcional por actividad
  @IsOptional()
  @IsString()
  activity?: string;
}
