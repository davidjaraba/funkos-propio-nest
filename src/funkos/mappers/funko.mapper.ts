import { Injectable } from '@nestjs/common'
import { Funko } from '../entities/funko.entity'
import { plainToClass } from 'class-transformer'
import { CreateFunkoDto } from '../dto/create-funko.dto'
import { Categoria } from '../../categorias/entities/categoria.entity'
import { ResponseFunkoDto } from '../dto/response-funko.dto'
import { UpdateFunkoDto } from '../dto/update-funko.dto'

@Injectable()
export class FunkoMapper {
  toFunkoResponse(funko: Funko) {
    return plainToClass(ResponseFunkoDto, {
      ...funko,
      precio: Number(funko.precio),
      categoria: funko.categoria.nombre,
    })
  }

  toFunko(dto: CreateFunkoDto | UpdateFunkoDto, categoria: Categoria) {
    return plainToClass(Funko, {
      ...dto,
      categoria,
    })
  }
}
