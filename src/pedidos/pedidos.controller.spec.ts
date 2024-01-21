import { Test, TestingModule } from '@nestjs/testing'
import { PedidosController } from './pedidos.controller'
import { PedidosService } from './pedidos.service'
import { PedidosMapper } from './mappers/pedidos.mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Funko } from '../funkos/entities/funko.entity'
import { Repository } from 'typeorm'

// describe('PedidosController', () => {
//   let controller: PedidosController
//
//   // beforeEach(async () => {
//   //   const module: TestingModule = await Test.createTestingModule({
//   //     controllers: [PedidosController],
//   //     providers: [PedidosService],
//   //   }).compile()
//   //
//   //   controller = module.get<PedidosController>(PedidosController)
//   // })
//   //
//   // it('should be defined', () => {
//   //   expect(controller).toBeDefined()
//   // })
// })
