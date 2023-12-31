import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { Categoria } from "./entities/categoria.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Funko } from "../funkos/entities/funko.entity";
import { CategoriaMapper } from './mapper/categoria.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria, Funko]),
  ],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriaMapper],
})
export class CategoriasModule {}
