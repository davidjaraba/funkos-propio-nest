import { Injectable } from '@nestjs/common';
import { Funko } from "../entities/funko.entity";
import { plainToClass } from "class-transformer";
import { CreateFunkoDto } from "../dto/create-funko.dto";
import { Categoria } from "../../categorias/entities/categoria.entity";

@Injectable()
export class FunkoMapper {


  toFunkoResponse(funko: Funko) {
    return plainToClass(Funko, funko, { excludeExtraneousValues: true })
  }

  toFunko(funkoCreateDTO: CreateFunkoDto, categoria: Categoria) {
    return plainToClass(Funko, {
      ...funkoCreateDTO,
      categoria
    })
  }


}
