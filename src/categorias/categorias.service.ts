import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from "./entities/categoria.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Funko } from "../funkos/entities/funko.entity";

@Injectable()
export class CategoriasService {

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    ) {
  }

  async create(createCategoriaDto: CreateCategoriaDto) {
    return await this.categoriaRepository.save(createCategoriaDto)
  }

  findAll() {
    return `This action returns all categorias`;
  }

  findOne(id: number) {
    return `This action returns a #${id} categoria`;
  }

  async findOneByNombre(nombre: string) {
    return (
      (await this.categoriaRepository.findOneBy({ nombre: nombre })) ||
      (() => {
        throw new NotFoundException('Categoria no encontrada');
      })()
    );
  }

  update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    return `This action updates a #${id} categoria`;
  }

  remove(id: number) {
    return `This action removes a #${id} categoria`;
  }
}
