import { Test, TestingModule } from '@nestjs/testing'
import { CategoriasService } from './categorias.service'
import { Categoria } from './entities/categoria.entity'
import { Repository } from 'typeorm'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { NotificationsGateway } from '../notifications/notifications.gateway'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

describe('CategoriasService', () => {
  let service: CategoriasService
  let categoriaRepo: Repository<Categoria>
  let mapper: CategoriaMapper
  let catNotificationsGateway: NotificationsGateway
  let cacheManager: Cache

  const categoriaToTest: Categoria = {
    id: '1',
    nombre: 'categoria1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: [],
  }

  const catNotificationsGatewayMock = {
    sendMessage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: getRepositoryToken(Categoria), useClass: Repository },
        {
          provide: NotificationsGateway,
          useValue: catNotificationsGatewayMock,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        CategoriaMapper,
      ],
    }).compile()

    categoriaRepo = module.get(getRepositoryToken(Categoria))
    mapper = module.get<CategoriaMapper>(CategoriaMapper)
    service = module.get<CategoriasService>(CategoriasService)
    catNotificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    test('devuelve todas las categorias', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValue([categoriaToTest]),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      }

      jest
        .spyOn(categoriaRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      const res: any = await service.findAll()

      expect(res).toEqual([categoriaToTest])
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'is_deleted = :isDeleted',
        { isDeleted: false },
      )
    })
  })

  describe('findOneBy', () => {
    test('devuelve una categoria por su id', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(categoriaToTest),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      }

      jest
        .spyOn(categoriaRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      const res: any = await service.findOne(
        'cbaafc73-db86-4848-a9d0-b0d49801f221',
      )

      expect(res).toEqual(categoriaToTest)
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'is_deleted = :isDeleted and id = :id',
        { isDeleted: false, id: 'cbaafc73-db86-4848-a9d0-b0d49801f221' },
      )
    })

    test('da error al no encontrar una categoria por su id', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(null),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      }

      jest
        .spyOn(categoriaRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      await expect(async () => {
        await service.findOne('cbaafc73-db86-4848-a9d0-b0d49801f221')
      }).rejects.toThrow(NotFoundException)

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'is_deleted = :isDeleted and id = :id',
        { isDeleted: false, id: 'cbaafc73-db86-4848-a9d0-b0d49801f221' },
      )
    })
  })

  describe('create', () => {
    test('crea una categoria', async () => {
      jest.spyOn(categoriaRepo, 'findOneBy').mockResolvedValue(null)

      jest.spyOn(categoriaRepo, 'save').mockResolvedValue(categoriaToTest)

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      const res = await service.create({ nombre: 'categoria1' })

      expect(res).toEqual(categoriaToTest)
      expect(categoriaRepo.findOneBy).toHaveBeenCalledWith({
        nombre: 'categoria1',
      })
    })

    test('da error al crear una categoria que ya existe', async () => {
      jest.spyOn(categoriaRepo, 'findOneBy').mockResolvedValue(categoriaToTest)

      await expect(async () => {
        await service.create({ nombre: 'categoria1' })
      }).rejects.toThrow(ConflictException)
    })
  })

  describe('update', () => {
    test('actualiza una categoria', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(categoriaToTest),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      }

      jest
        .spyOn(categoriaRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(categoriaRepo, 'findOneBy').mockResolvedValue(null)

      jest.spyOn(categoriaRepo, 'save').mockResolvedValue(categoriaToTest)

      jest.spyOn(mapper, 'toResponseDto').mockReturnValue(categoriaToTest)

      const res = await service.update('cbaafc73-db86-4848-a9d0-b0d49801f221', {
        nombre: 'categoria1',
      })

      expect(res).toEqual(categoriaToTest)
      expect(categoriaRepo.findOneBy).toHaveBeenCalledWith({
        nombre: 'categoria1',
      })
    })
  })

  describe('remove', () => {
    test('elimina una categoria', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(categoriaToTest),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      }

      jest
        .spyOn(categoriaRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(categoriaRepo, 'delete').mockResolvedValue(null)

      await service.remove('cbaafc73-db86-4848-a9d0-b0d49801f221')

      expect(categoriaRepo.delete).toHaveBeenCalledWith(
        'cbaafc73-db86-4848-a9d0-b0d49801f221',
      )
    })
  })
})
