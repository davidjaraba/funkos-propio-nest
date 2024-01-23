import { Test, TestingModule } from '@nestjs/testing'
import { PedidosController } from './pedidos.controller'
import { PedidosService } from './pedidos.service'
import { PedidosMapper } from './mappers/pedidos.mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Funko } from '../funkos/entities/funko.entity'
import { Repository } from 'typeorm'
import { Pedido } from "./entities/pedido.entity";
import { Usuario } from "../users/entities/user.entity";

describe('PedidosController', () => {
  let controller: PedidosController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [
        PedidosService,
        { provide: getRepositoryToken(Pedido, 'mongo'), useClass: Repository },
        PedidosMapper,
        { provide: getRepositoryToken(Funko), useClass: Repository },
        { provide: getRepositoryToken(Usuario), useClass: Repository },],
    }).compile()

    controller = module.get<PedidosController>(PedidosController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
