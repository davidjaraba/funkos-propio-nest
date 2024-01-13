import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { Categoria } from './entities/categoria.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoriaMapper } from './mapper/categoria.mapper'
import {
  Notificacion,
  NotificacionTipo,
} from '../notifications/entities/notification.entity'
import { NotificationsGateway } from '../notifications/notifications.gateway'
import { ResponseCategoriaDto } from './dto/response-categoria.dto'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { ResponseFunkoDto } from '../funkos/dto/response-funko.dto'

@Injectable()
export class CategoriasService {
  private readonly logger: Logger = new Logger(CategoriasService.name)

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    private readonly categoriaMapper: CategoriaMapper,
    private readonly categoriaNotificationsGateway: NotificationsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    if (
      await this.categoriaRepository.findOneBy({
        nombre: createCategoriaDto.nombre,
      })
    ) {
      throw new ConflictException('La categoria ya existe')
    }

    const res = await this.categoriaRepository.save(createCategoriaDto)

    this.onChange(NotificacionTipo.CREATE, res)

    await this.invalidateCacheKey('all_categorias')

    return res
  }

  async findAll() {
    const cache = await this.cacheManager.get(`all_cats`)
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    const res = await this.categoriaRepository
      .createQueryBuilder()
      .where('is_deleted = :isDeleted', { isDeleted: false })
      .getMany()

    await this.cacheManager.set(`all_cats`, res)

    return res
  }

  async findOne(id: string) {
    const cache: Categoria = await this.cacheManager.get(`cat_${id}`)

    if (cache) {
      console.log('Cache hit')
      this.logger.log('Cache hit')
      return cache
    }

    const res =
      (await this.categoriaRepository
        .createQueryBuilder()
        .where('is_deleted = :isDeleted and id = :id', { isDeleted: false, id })
        .getOne()) ||
      (() => {
        throw new NotFoundException('Categoria no encontrada')
      })()

    await this.cacheManager.set(`cat_${id}`, res)

    return res
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id)

    if (
      await this.categoriaRepository.findOneBy({
        nombre: updateCategoriaDto.nombre,
      })
    ) {
      throw new ConflictException('La categoria ya existe')
    }

    const res = this.categoriaMapper.toResponseDto(
      await this.categoriaRepository.save({ ...updateCategoriaDto, id: id }),
    )

    await this.invalidateCacheKey(`cat_${id}`)
    await this.invalidateCacheKey('all_cats')

    this.onChange(NotificacionTipo.UPDATE, res)

    return res
  }

  async remove(id: string) {
    const catToDelete = await this.findOne(id)

    await this.categoriaRepository.delete(id)
    this.onChange(NotificacionTipo.DELETE, catToDelete)

    await this.invalidateCacheKey(`cat_${id}`)
    await this.invalidateCacheKey('all_cats')
  }

  async removeSoft(id: string) {
    const catToDelete = await this.findOne(id)

    await this.categoriaRepository
      .createQueryBuilder()
      .update()
      .set({ isDeleted: true })
      .where('id = :id', { id })
      .execute()

    this.onChange(NotificacionTipo.DELETE, catToDelete)

    await this.invalidateCacheKey(`cat_${id}`)
    await this.invalidateCacheKey('all_cats')
  }

  private onChange(tipo: NotificacionTipo, data: ResponseCategoriaDto) {
    const notificacion = new Notificacion<ResponseCategoriaDto>(
      'CATEGORIAS',
      tipo,
      data,
      new Date(),
    )
    this.categoriaNotificationsGateway.sendMessage(notificacion)
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
