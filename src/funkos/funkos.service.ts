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

  async findAll() {
    const res = await this.funkoRepository.createQueryBuilder('funko').where("isDeleted = :isDeleted", { isDeleted: false }).leftJoinAndSelect('funko.categoria', 'categoria').getMany()
    return res.map((fk) => this.funkoMapper.toFunkoResponse(fk));
  }

  async findOne(id: number) {
    return this.funkoMapper.toFunkoResponse(
      await this.funkoRepository.createQueryBuilder('funko').where("isDeleted = :isDeleted and funko.id = :id", { isDeleted: false, id }).leftJoinAndSelect('funko.categoria', 'categoria').getOne() ||
      (() => {
        throw new NotFoundException('Funko no encontrado')
      })()
    )
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {

    await this.findOne(id)

    const categoria = await this.categoriaRepository.findOneBy({ nombre: updateFunkoDto.categoria }) || (() => {
      throw new NotFoundException('Categoria no encontrada')
    })();

    const funko = this.funkoMapper.toFunko(updateFunkoDto, categoria)

    return this.funkoMapper.toFunkoResponse(await this.funkoRepository.save(funko))

  }

  async remove(id: number) {

    await this.findOne(id)

    return this.funkoRepository.delete(id)

  }

  async softRemove(id: number) {

      await this.findOne(id)

      await this.funkoRepository.createQueryBuilder().where("id = :id", { id: id }).update(
        Funko
      ).set({
        isDeleted: true
      }).execute()

  }


}
