import { Test, TestingModule } from '@nestjs/testing'
import { PedidosService } from './pedidos.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Funko } from '../funkos/entities/funko.entity'
import { Repository } from 'typeorm'
import { Pedido } from './entities/pedido.entity'
import { FunkoMapper } from '../funkos/mappers/funko.mapper'
import { PedidosMapper } from './mappers/pedidos.mapper'
import { Usuario } from '../users/entities/user.entity'

describe('PedidosService', () => {
  let service: PedidosService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: getRepositoryToken(Pedido, 'mongo'), useClass: Repository },
        PedidosMapper,
        { provide: getRepositoryToken(Funko), useClass: Repository },
        { provide: getRepositoryToken(Usuario), useClass: Repository },
      ],
    }).compile()

    service = module.get<PedidosService>(PedidosService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
