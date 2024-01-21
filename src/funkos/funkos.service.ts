import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Funko } from './entities/funko.entity'
import { Categoria } from '../categorias/entities/categoria.entity'
import { FunkoMapper } from './mappers/funko.mapper'
import { StorageService } from '../storage/storage.service'
import {
  Notificacion,
  NotificacionTipo,
} from '../notifications/entities/notification.entity'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { NotificationsGateway } from '../notifications/notifications.gateway'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { hash } from 'typeorm/util/StringUtils'
import { query } from 'express'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'

@Injectable()
export class FunkosService {
  private readonly logger: Logger = new Logger(FunkosService.name)

  constructor(
    @InjectRepository(Funko)
    private readonly funkoRepository: Repository<Funko>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly funkoMapper: FunkoMapper,
    private readonly storageService: StorageService,
    private readonly funkoNotificationsGateway: NotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Crea un nuevo funko
   * @param createFunkoDto
   */
  async create(createFunkoDto: CreateFunkoDto) {
    const categoria =
      (await this.categoriaRepository.findOneBy({
        nombre: createFunkoDto.categoria,
      })) ||
      (() => {
        throw new NotFoundException('Categoria no encontrada')
      })()

    const funko = this.funkoMapper.toFunko(createFunkoDto, categoria)

    await this.funkoRepository.save(funko)

    const res = this.funkoMapper.toFunkoResponse(funko)

    this.onChange(NotificacionTipo.CREATE, res)

    await this.invalidateCacheKey('all_funkos')

    return res
  }

  /**
   * Devuelve todos los funkos
   * @param query
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Find all funkos')
    // check cache
    const cache = await this.cacheManager.get(
      `all_funkos_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    // Creo el queryBuilder para poder hacer el leftJoinAndSelect con la categoría
    const queryBuilder = this.funkoRepository
      .createQueryBuilder('funko')
      .leftJoinAndSelect('funko.categoria', 'categoria')

    const pagination = await paginate(query, queryBuilder, {
      sortableColumns: ['nombre', 'precio', 'stock'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['nombre', 'precio', 'stock'],
      filterableColumns: {
        marca: [FilterOperator.EQ, FilterSuffix.NOT],
        modelo: [FilterOperator.EQ, FilterSuffix.NOT],
        descripcion: [FilterOperator.EQ, FilterSuffix.NOT],
        nombre: true,
        precio: true,
        stock: true,
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
      //select: ['id', 'marca', 'modelo', 'descripcion', 'precio', 'stock'],
    })

    const res = {
      data: (pagination.data ?? []).map((fk) =>
        this.funkoMapper.toFunkoResponse(fk),
      ),
      meta: pagination.meta,
      links: pagination.links,
    }

    // Guardamos en caché
    await this.cacheManager.set(
      `all_products_page_${hash(JSON.stringify(query))}`,
      res,
      60,
    )
    return res
  }

  /**
   * Devuelve un funko por id
   * @param id
   */
  async findOne(id: number) {
    const cache: ResponseFunkoDto = await this.cacheManager.get(`funko_${id}`)

    if (cache) {
      console.log('Cache hit')
      this.logger.log('Cache hit')
      return cache
    }

    const res = this.funkoMapper.toFunkoResponse(
      (await this.funkoRepository
        .createQueryBuilder('funko')
        .where('isDeleted = :isDeleted and funko.id = :id', {
          isDeleted: false,
          id,
        })
        .leftJoinAndSelect('funko.categoria', 'categoria')
        .getOne()) ||
        (() => {
          throw new NotFoundException('Funko no encontrado')
        })(),
    )

    await this.cacheManager.set(`funko_${id}`, res)

    return res
  }

  /**
   * Actualiza un funko
   * @param id
   * @param updateFunkoDto
   */
  async update(id: number, updateFunkoDto: UpdateFunkoDto) {
    const funkoToUpdate = await this.findOne(id)

    const categoria =
      (await this.categoriaRepository.findOneBy({
        nombre: updateFunkoDto.categoria,
      })) ||
      (() => {
        throw new NotFoundException('Categoria no encontrada')
      })()

    const funko = this.funkoMapper.toFunko(updateFunkoDto, categoria)

    console.log(funko)

    await this.funkoRepository.save({ ...funko, id })

    const res = this.funkoMapper.toFunkoResponse({
      ...funkoToUpdate,
      ...funko,
    })

    this.onChange(NotificacionTipo.UPDATE, res)

    await this.invalidateCacheKey('all_funkos')

    return res
  }

  /**
   * Elimina un funko
   * @param id
   */
  async remove(id: number) {
    const res = await this.findOne(id)

    this.onChange(NotificacionTipo.DELETE, res)

    await this.invalidateCacheKey(`funko_${id}`)
    await this.invalidateCacheKey('all_funkos')

    return this.funkoRepository.delete(id)
  }

  /**
   * Elimina un funko
   * @param id
   */
  async softRemove(id: number) {
    const res = await this.findOne(id)

    await this.funkoRepository
      .createQueryBuilder()
      .where('id = :id', { id: id })
      .update(Funko)
      .set({
        isDeleted: true,
      })
      .execute()

    await this.invalidateCacheKey(`funko_${id}`)
    await this.invalidateCacheKey('all_funkos')

    this.onChange(NotificacionTipo.DELETE, res)
  }

  /**
   * Actualiza la imagen de un funko
   * @param id
   * @param file
   * @param req
   */
  async updateImage(id: number, file: Express.Multer.File, req: Request) {
    if (!file) throw new BadRequestException('Fichero no enviado')

    const foundFk = await this.findOne(id)

    if (foundFk.imagen && this.storageService.exists(foundFk.imagen)) {
      this.storageService.removeFile(foundFk.imagen)
    }

    const funkoToUpdate = { ...foundFk, imagen: file.filename }

    const categoria =
      (await this.categoriaRepository.findOneBy({
        nombre: funkoToUpdate.categoria,
      })) ||
      (() => {
        throw new NotFoundException('Categoria no encontrada')
      })()

    const funko = this.funkoMapper.toFunko(funkoToUpdate, categoria)

    await this.funkoRepository.save(funko)

    const res = this.funkoMapper.toFunkoResponse(funko)

    this.onChange(NotificacionTipo.UPDATE, res)

    return res
  }

  /**
   * Envía una notificación de cambio
   * @param tipo
   * @param data
   * @private
   */
  private onChange(tipo: NotificacionTipo, data: ResponseFunkoDto) {
    const notificacion = new Notificacion<ResponseFunkoDto>(
      'PRODUCTOS',
      tipo,
      data,
      new Date(),
    )
    this.funkoNotificationsGateway.sendMessage(notificacion)
  }

  /**
   * Invalida una clave de caché
   * @param keyPattern
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
