import { Module } from '@nestjs/common';
import { FunkosService } from './funkos.service';
import { FunkosController } from './funkos.controller';
import { Funko } from "./entities/funko.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categoria } from "../categorias/entities/categoria.entity";
import { FunkoMapper } from './mappers/funko.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Funko, Categoria]),
  ],
  controllers: [FunkosController],
  providers: [FunkosService, FunkoMapper, ],
})
export class FunkosModule {}
