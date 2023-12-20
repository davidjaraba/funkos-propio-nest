import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator'

import { Transform } from 'class-transformer'

export class CreateFunkoDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser un string' })
  @Transform(({ value }) => value.trim())
  nombre: string

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber({}, { message: 'El precio debe ser un numero' })
  @IsPositive({ message: 'El precio debe ser positivo' })
  precio: number

  @IsNotEmpty({ message: 'La categoria es requerida' })
  categoria: string

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber({}, { message: 'La cantidad debe ser un numero' })
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  cantidad: number

  @IsOptional()
  @IsString({ message: 'La imagen debe ser un string' })
  imagen: string

  @IsNotEmpty({ message: 'El stock es requerido' })
  @IsNumber({}, { message: 'El stock debe ser un numero' })
  @IsPositive({ message: 'El stock debe ser positivo' })
  stock: number
}
