import { Injectable } from '@nestjs/common';
import { Categoria } from '../entities/categoria.entity'
import { plainToClass } from 'class-transformer'
import { ResponseCategoriaDto } from '../dto/response-categoria.dto'

@Injectable()
export class CategoriaMapper {



  toResponseDto(categoria: Categoria) {

    return plainToClass(ResponseCategoriaDto, categoria)

  }



}
