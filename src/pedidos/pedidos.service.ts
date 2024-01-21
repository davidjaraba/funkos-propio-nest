import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Pedido } from './entities/pedido.entity'
import { MongoRepository, Repository } from 'typeorm'
import { ObjectId } from 'mongodb'
import { PedidosMapper } from './mappers/pedidos.mapper'
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate'
import { Funko } from '../funkos/entities/funko.entity'
import { Usuario } from '../users/entities/user.entity'

export const PedidosOrderByValues: string[] = ['_id', 'idUsuario'] // Lo usamos en los pipes
export const PedidosOrderValues: string[] = ['asc', 'desc'] // Lo usamos en los pipes

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name)

  constructor(
    @InjectRepository(Pedido, 'mongo')
    private readonly pedidoRepository: MongoRepository<Pedido>,
    private readonly pedidoMapper: PedidosMapper,
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createPedidoDto: CreatePedidoDto) {
    this.logger.log(`Creando pedido ${JSON.stringify(createPedidoDto)}`)
    console.log(`Guardando pedido: ${createPedidoDto}`)

    const pedidoToBeSaved = this.pedidoMapper.toEntity(createPedidoDto)

    await this.checkPedido(pedidoToBeSaved)

    const pedidoToSave = await this.reserveStockPedidos(pedidoToBeSaved)

    pedidoToSave.createdAt = new Date()
    pedidoToSave.updatedAt = new Date()

    return await this.pedidoRepository.save(pedidoToSave)
  }

  async findAll(options: PaginationAdvanced): Promise<Pagination<Pedido>> {
    return paginate<Pedido>(this.pedidoRepository, options, {
      where: { isDeleted: options.isDeleted },
    })
  }

  async findOne(id: string) {
    const res = await this.pedidoRepository.findOne({
      where: {
        _id: { $eq: new ObjectId(id) },
        isDeleted: { $eq: false },
      },
    })

    return (
      res ||
      (() => {
        throw new NotFoundException('Pedido no encontrado')
      })()
    )
  }

  async findOneByIdUsuario(idUsuario: number) {
    return await this.pedidoRepository.find({
      where: {
        idUsuario: { $eq: idUsuario },
        isDeleted: { $eq: false },
      },
    })
  }

  async update(id: string, updatePedidoDto: UpdatePedidoDto) {
    const currPedido = await this.findOne(id)

    const pedidoToBeSaved = this.pedidoMapper.toEntity({
      ...currPedido,
      ...updatePedidoDto,
    })

    this.logger.log(
      `Actualizando pedido con id ${id} y ${JSON.stringify(pedidoToBeSaved)}`,
    )

    await this.returnStockPedidos(pedidoToBeSaved)

    await this.checkPedido(pedidoToBeSaved)
    const pedidoToSave = await this.reserveStockPedidos(pedidoToBeSaved)

    pedidoToSave.updatedAt = new Date()

    return await this.pedidoRepository.save({ ...pedidoToSave, id })
  }

  async remove(id: string) {
    const pedidoToDelete = await this.findOne(id)

    await this.returnStockPedidos(pedidoToDelete)

    await this.pedidoRepository.update(
      { id: new ObjectId(id) },
      { isDeleted: true },
    )
  }

  private async checkPedido(pedido: Pedido): Promise<void> {
    this.logger.log(`Comprobando pedido ${JSON.stringify(pedido)}`)
    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new BadRequestException(
        'No se han agregado lineas de pedido al pedido actual',
      )
    }

    for (const lineaPedido of pedido.lineasPedido) {
      const producto = await this.funkoRepository.findOneBy({
        id: lineaPedido.idProducto,
      })
      console.log(producto)
      if (!producto) {
        throw new BadRequestException(
          'El producto con id ${lineaPedido.idProducto} no existe',
        )
      }
      if (producto.stock < lineaPedido.cantidad && lineaPedido.cantidad > 0) {
        throw new BadRequestException(
          `La cantidad solicitada no es válida o no hay suficiente stock del producto ${producto.id}`,
        )
      }
      if (parseFloat(String(producto.precio)) !== lineaPedido.precioProducto) {
        throw new BadRequestException(
          `El precio del producto ${producto.id} del pedido no coincide con el precio actual del producto`,
        )
      }
    }
  }

  private async reserveStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Reservando stock del pedido: ${pedido}`)

    if (!pedido.lineasPedido || pedido.lineasPedido.length === 0) {
      throw new BadRequestException(`No se han agregado lineas de pedido`)
    }

    for (const lineaPedido of pedido.lineasPedido) {
      const producto = await this.funkoRepository.findOneBy({
        id: lineaPedido.idProducto,
      })
      producto.stock -= lineaPedido.cantidad
      await this.funkoRepository.save(producto)
      lineaPedido.total = lineaPedido.cantidad * lineaPedido.precioProducto
    }

    pedido.total = pedido.lineasPedido.reduce(
      (sum, lineaPedido) =>
        sum + lineaPedido.cantidad * lineaPedido.precioProducto,
      0,
    )
    pedido.totalItems = pedido.lineasPedido.reduce(
      (sum, lineaPedido) => sum + lineaPedido.cantidad,
      0,
    )

    return pedido
  }

  async userExists(idUsuario: number): Promise<boolean> {
    this.logger.log(`Comprobando si existe el usuario ${idUsuario}`)
    const usuario = await this.usuariosRepository.findOneBy({ id: idUsuario })
    return !!usuario
  }

  async getPedidosByUser(idUsuario: number): Promise<Pedido[]> {
    this.logger.log(`Buscando pedidos por usuario ${idUsuario}`)
    return await this.pedidoRepository.find({ idUsuario })
  }

  private async returnStockPedidos(pedido: Pedido): Promise<Pedido> {
    this.logger.log(`Retornando stock del pedido: ${pedido}`)
    if (pedido.lineasPedido) {
      for (const lineaPedido of pedido.lineasPedido) {
        const producto = await this.funkoRepository.findOneBy({
          id: lineaPedido.idProducto,
        })
        producto.stock += lineaPedido.cantidad
        await this.funkoRepository.save(producto)
      }
    }
    return pedido
  }
}

export interface PaginationAdvanced extends IPaginationOptions {
  isDeleted?: boolean
}
