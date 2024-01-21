import { Module } from '@nestjs/common'
import { PedidosService } from './pedidos.service'
import { PedidosController } from './pedidos.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Funko } from '../funkos/entities/funko.entity'
import { Categoria } from '../categorias/entities/categoria.entity'
import { Pedido } from './entities/pedido.entity'
import { FunkoMapper } from '../funkos/mappers/funko.mapper'
import { PedidosMapper } from './mappers/pedidos.mapper'
import { Usuario } from '../users/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Funko, Usuario]),
    TypeOrmModule.forFeature([Pedido], 'mongo'),
  ],
  controllers: [PedidosController],
  providers: [PedidosService, PedidosMapper],
  exports: [PedidosService],
})
export class PedidosModule {}
