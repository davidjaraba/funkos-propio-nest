import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateFunkoDto } from "./dto/create-funko.dto";
import { UpdateFunkoDto } from "./dto/update-funko.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Funko } from "./entities/funko.entity";
import { Categoria } from "../categorias/entities/categoria.entity";
import { FunkoMapper } from "./mappers/funko.mapper";
import { StorageService } from "../storage/storage.service";
import { Notificacion, NotificacionTipo } from "../notifications/entities/notification.entity";
import { ResponseFunkoDto } from "./dto/response-funko.dto";
import { NotificationsGateway } from "../notifications/notifications.gateway";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager'
import { hash } from "typeorm/util/StringUtils";
import { query } from "express";

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
  ) {
  }


  async create(createFunkoDto: CreateFunkoDto) {

    const categoria = await this.categoriaRepository.findOneBy({ nombre: createFunkoDto.categoria }) || (() => {
      throw new NotFoundException('Categoria no encontrada')
    })();

    const funko = this.funkoMapper.toFunko(createFunkoDto, categoria)

    await this.funkoRepository.save(funko)

    const res = this.funkoMapper.toFunkoResponse(funko)

    this.onChange(NotificacionTipo.CREATE, res)

    await this.invalidateCacheKey('all_funkos')

    return res

  }

  async findAll() {
    const cache = await this.cacheManager.get(
      `all_funkos`,
    )
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }

    const res = await this.funkoRepository.createQueryBuilder('funko').where("isDeleted = :isDeleted", { isDeleted: false }).leftJoinAndSelect('funko.categoria', 'categoria').getMany()

    const funkosRes = res.map((fk) => this.funkoMapper.toFunkoResponse(fk))

    await this.cacheManager.set(
      `all_funkos`,
      funkosRes,
    )

    return funkosRes

  }

  async findOne(id: number) {

    const cache: ResponseFunkoDto = await this.cacheManager.get(
      `funko_${id}`,
    )

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
          throw new NotFoundException('Funko no encontrado');
      })()
    )

    await this.cacheManager.set(`funko_${id}`, res)

    return res
  }

  async update(id: number, updateFunkoDto: UpdateFunkoDto) {

    await this.findOne(id)

    const categoria = await this.categoriaRepository.findOneBy({ nombre: updateFunkoDto.categoria }) || (() => {
      throw new NotFoundException('Categoria no encontrada')
    })();

    const funko = this.funkoMapper.toFunko(updateFunkoDto, categoria)

    const res = this.funkoMapper.toFunkoResponse(await this.funkoRepository.save(funko))

    this.onChange(NotificacionTipo.UPDATE, res)

    await this.invalidateCacheKey('all_products')

    return res

  }

  async remove(id: number) {

    const res = await this.findOne(id)

    this.onChange(NotificacionTipo.DELETE, res)

    await this.invalidateCacheKey(`funko_${id}`)
    await this.invalidateCacheKey('all_products')

    return this.funkoRepository.delete(id)

  }

  async softRemove(id: number) {

      const res = await this.findOne(id)

      await this.funkoRepository.createQueryBuilder().where("id = :id", { id: id }).update(
        Funko
      ).set({
        isDeleted: true
      }).execute()

      await this.invalidateCacheKey(`funko_${id}`)
      await this.invalidateCacheKey('all_products')


      this.onChange(NotificacionTipo.DELETE, res)

  }

  async updateImage(id: number, file: Express.Multer.File, req: Request){

    if (!file) throw new BadRequestException('Fichero no enviado')

    const foundFk = await this.findOne(id)

    if (foundFk.imagen && this.storageService.exists(foundFk.imagen)){
      this.storageService.removeFile(foundFk.imagen)
    }

    const funkoToUpdate = { ...foundFk, imagen: file.filename };

    const categoria = await this.categoriaRepository.findOneBy({ nombre: funkoToUpdate.categoria }) || (() => {
      throw new NotFoundException('Categoria no encontrada')
    })();

    const funko = this.funkoMapper.toFunko(funkoToUpdate, categoria)

    await this.funkoRepository.save(funko)

    const res = this.funkoMapper.toFunkoResponse(funko)

    this.onChange(NotificacionTipo.UPDATE, res)

    return res

  }

  private onChange(tipo: NotificacionTipo, data: ResponseFunkoDto) {
    const notificacion = new Notificacion<ResponseFunkoDto>(
      'PRODUCTOS',
      tipo,
      data,
      new Date(),
    )
    this.funkoNotificationsGateway.sendMessage(notificacion)
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

}
