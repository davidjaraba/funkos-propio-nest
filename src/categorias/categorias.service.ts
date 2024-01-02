import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Funko } from '../funkos/entities/funko.entity';
import { CategoriaMapper } from './mapper/categoria.mapper';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriaMapper: CategoriaMapper,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    if (
      await this.categoriaRepository.findOneBy({
        nombre: createCategoriaDto.nombre,
      })
    ) {
      throw new ConflictException('La categoria ya existe');
    }

    return await this.categoriaRepository.save(createCategoriaDto);
  }

  async findAll() {
    return await this.categoriaRepository
      .createQueryBuilder()
      .where('is_deleted = :isDeleted', { isDeleted: false })
      .getMany();
  }

  async findOne(id: string) {
    return (
      (await this.categoriaRepository
        .createQueryBuilder()
        .where('is_deleted = :isDeleted and id = :id', { isDeleted: false, id })
        .getOne()) ||
      (() => {
        throw new NotFoundException('Categoria no encontrada');
      })()
    );
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id);

    if (
      await this.categoriaRepository.findOneBy({
        nombre: updateCategoriaDto.nombre,
      })
    ) {
      throw new ConflictException('La categoria ya existe');
    }

    return this.categoriaMapper.toResponseDto(
      await this.categoriaRepository.save({ ...updateCategoriaDto, id: id }),
    );
  }

  async remove(id: string) {
    await this.categoriaRepository.delete(id);
  }

  async removeSoft(id: string) {
    await this.categoriaRepository
      .createQueryBuilder()
      .update()
      .set({ isDeleted: true })
      .where('id = :id', { id })
      .execute();
  }
}
