import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateFunkoDto } from './dto/create-funko.dto';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Funko } from "./entities/funko.entity";
import { Categoria } from "../categorias/entities/categoria.entity";
import { FunkoMapper } from "./mappers/funko.mapper";

@Injectable()
export class FunkosService {

  constructor(
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly funkoMapper: FunkoMapper,
  ) {
  }


  async create(createFunkoDto: CreateFunkoDto) {

    const categoria = await this.categoriaRepository.findOneBy({ nombre: createFunkoDto.categoria }) || (() => {
      throw new NotFoundException('Categoria no encontrada')
    })();

    const funko = this.funkoMapper.toFunko(createFunkoDto, categoria)

    await this.funkoRepository.save(funko)

    return this.funkoMapper.toFunkoResponse(funko)

  }

  findAll() {
    return `This action returns all funkos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} funko`;
  }

  update(id: number, updateFunkoDto: UpdateFunkoDto) {
    return `This action updates a #${id} funko`;
  }

  remove(id: number) {
    return `This action removes a #${id} funko`;
  }
}
