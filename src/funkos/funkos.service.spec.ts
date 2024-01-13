import { Test, TestingModule } from '@nestjs/testing';
import { FunkosService } from './funkos.service';
import { Repository } from 'typeorm';
import { Funko } from './entities/funko.entity';
import { FunkoMapper } from './mappers/funko.mapper';
import { Categoria } from '../categorias/entities/categoria.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResponseFunkoDto } from './dto/response-funko.dto';
import { NotFoundException } from '@nestjs/common';
import { ResponseCategoriaDto } from '../categorias/dto/response-categoria.dto';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { StorageService } from '../storage/storage.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Cache } from 'cache-manager';
import { UpdateFunkoDto } from './dto/update-funko.dto';
import { Paginated } from 'nestjs-paginate';

describe('FunkosService', () => {
  let service: FunkosService;
  let funkoRepo: Repository<Funko>;
  let mapper: FunkoMapper;
  let categoriaRepo: Repository<Categoria>;
  let storageService: StorageService;
  let cacheManager: Cache;
  let funkosNotificationsGateway: NotificationsGateway;

  const funkosToTest: Funko[] = [
    {
      id: 1,
      nombre: 'funko1',
      imagen: 'funko1',
      precio: 2,
      cantidad: 3,
      stock: 3,
      categoria: {
        id: '1',
        nombre: 'categoria1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
    {
      id: 2,
      nombre: 'funko2',
      imagen: 'funko2',
      precio: 2,
      cantidad: 3,
      stock: 3,
      categoria: {
        id: '2',
        nombre: 'categoria2',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        funkos: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ];

  const funkoMapper = {
    toFunko: jest.fn(),
    toFunkoResponse: jest.fn(),
  };

  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithouUrl: jest.fn(),
  };

  const productsNotificationsGatewayMock = {
    sendMessage: jest.fn(),
  };

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FunkosService,
        { provide: getRepositoryToken(Funko), useClass: Repository },
        { provide: getRepositoryToken(Categoria), useClass: Repository },
        { provide: FunkoMapper, useValue: funkoMapper },
        { provide: StorageService, useValue: storageServiceMock },
        {
          provide: NotificationsGateway,
          useValue: productsNotificationsGatewayMock,
        },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile();

    mapper = module.get<FunkoMapper>(FunkoMapper);
    funkoRepo = module.get(getRepositoryToken(Funko));
    service = module.get<FunkosService>(FunkosService);
    categoriaRepo = module.get(getRepositoryToken(Categoria));
    storageService = module.get<StorageService>(StorageService); // Obtenemos una instancia del servicio de almacenamiento
    funkosNotificationsGateway =
      module.get<NotificationsGateway>(NotificationsGateway); // Obtenemos una instancia del gateway de notificaciones
    cacheManager = module.get<Cache>(CACHE_MANAGER); // Obtenemos una instancia del cache manager
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    test('devuelve todos los funkos', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValue(funkosToTest),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      };

      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'funkos',
      };

      const testFunkos = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          currentPage: 1,
          totalPages: 1,
        },
        links: {
          current: 'funkos?page=1&limit=10&sortBy=nombre:ASC',
        },
      } as Paginated<ResponseFunkoDto>;

      jest
        .spyOn(mapper, 'toFunkoResponse')
        .mockReturnValue(new ResponseFunkoDto());

      jest
        .spyOn(funkoRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest.spyOn(cacheManager, 'get').mockResolvedValue(testFunkos);

      const res: any = await service.findAll(paginateOptions);

      expect(res.meta.itemsPerPage).toEqual(paginateOptions.limit);
      expect(res.meta.currentPage).toEqual(paginateOptions.page);
      expect(res.links.current).toEqual(
        `funkos?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=nombre:ASC`,
      );
      expect(cacheManager.get).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    test('devuelve un producto que tenga la id', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      jest
        .spyOn(mapper, 'toFunkoResponse')
        .mockReturnValue(new ResponseFunkoDto());

      jest
        .spyOn(funkoRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const res: any = await service.findOne(1);
      console.log(res);

      expect(res).toEqual(new ResponseFunkoDto());
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'isDeleted = :isDeleted and funko.id = :id',
        { isDeleted: false, id: 1 },
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'funko.categoria',
        'categoria',
      );
      expect(mockQueryBuilder.getOne).toHaveBeenCalled();
    });

    test('devuelve un producto que tenga la id sin encontrarlo', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(null),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      // tiene que devolver una excepcion
      jest
        .spyOn(mapper, 'toFunkoResponse')
        .mockReturnValue(new ResponseFunkoDto());

      jest
        .spyOn(funkoRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await expect(async () => {
        await service.findOne(1);
      }).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    test('crea un producto', async () => {
      const mockResponseFunkoDto = new ResponseFunkoDto();

      jest.spyOn(categoriaRepo, 'findOneBy').mockResolvedValue(new Categoria());

      jest.spyOn(mapper, 'toFunko').mockReturnValue(new Funko());

      jest.spyOn(funkoRepo, 'save').mockResolvedValue(new Funko());

      jest
        .spyOn(mapper, 'toFunkoResponse')
        .mockReturnValue(mockResponseFunkoDto);

      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([]);

      expect(await service.create(new CreateFunkoDto())).toEqual(
        mockResponseFunkoDto,
      );

      expect(mapper.toFunkoResponse).toHaveBeenCalled();
      expect(funkoRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('actualiza un funko', async () => {
      const mockResponseFunkoDto = new ResponseFunkoDto();

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      };

      jest
        .spyOn(funkoRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest.spyOn(categoriaRepo, 'findOneBy').mockResolvedValue(new Categoria());

      jest.spyOn(mapper, 'toFunko').mockReturnValue(new Funko());

      jest.spyOn(funkoRepo, 'save').mockResolvedValue(new Funko());

      jest
        .spyOn(mapper, 'toFunkoResponse')
        .mockReturnValue(mockResponseFunkoDto);

      expect(await service.update(1, new CreateFunkoDto())).toEqual(
        mockResponseFunkoDto,
      );

      expect(mapper.toFunkoResponse).toHaveBeenCalled();
      expect(funkoRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    test('elimina un funko', () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      };

      jest
        .spyOn(funkoRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest.spyOn(funkoRepo, 'delete').mockResolvedValue({
        affected: 1,
        raw: [],
      });

      expect(service.remove(1)).resolves.toEqual({
        affected: 1,
        raw: [],
      });
    });
  });

  describe('removeSoft', () => {
    test('elimina un funko mediante borrado logico', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };

      jest
        .spyOn(funkoRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      expect(await service.softRemove(1)).toBeUndefined();
    });
  });

  describe('updateImage', () => {
    test('actualiza la imagen de un producto', async () => {
      const mockRequest = {
        protocol: 'http',
        get: () => 'localhost',
      };
      const mockFile = {
        filename: 'new_image',
      };

      const mockProductoEntity = new Funko();
      const mockResponseFunkoDto = new ResponseFunkoDto();

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
      };

      jest
        .spyOn(funkoRepo, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      jest.spyOn(categoriaRepo, 'findOneBy').mockResolvedValue(new Categoria());

      jest.spyOn(mapper, 'toFunko').mockReturnValue(mockProductoEntity);

      jest.spyOn(funkoRepo, 'save').mockResolvedValue(mockProductoEntity);

      jest
        .spyOn(mapper, 'toFunkoResponse')
        .mockReturnValue(mockResponseFunkoDto);

      expect(
        await service.updateImage(1, mockFile as any, mockRequest as any),
      ).toEqual(mockResponseFunkoDto);

      expect(mapper.toFunkoResponse).toHaveBeenCalled();
      expect(funkoRepo.save).toHaveBeenCalled();
    });
  });
});
