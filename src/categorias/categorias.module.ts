import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { Categoria } from "./entities/categoria.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Funko } from "../funkos/entities/funko.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Categoria, Funko]),
  ],
  controllers: [CategoriasController],
  providers: [CategoriasService],
})
export class CategoriasModule {}
