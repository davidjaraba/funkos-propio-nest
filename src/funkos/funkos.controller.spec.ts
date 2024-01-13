import { Test, TestingModule } from '@nestjs/testing';
import { FunkosController } from './funkos.controller';
import { FunkosService } from './funkos.service';
import { CreateFunkoDto } from './dto/create-funko.dto';
import { CacheModule } from '@nestjs/cache-manager';
import { Paginated } from 'nestjs-paginate';
import { ResponseFunkoDto } from './dto/response-funko.dto';

describe('FunkosController', () => {
  let controller: FunkosController;

  let service: FunkosService;

  const categoria = {
    id: '1',
    nombre: 'categoria1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: [],
  };

  // const funko = {
  //   id: 1,
  //   nombre: 'funko1',
  //   imagen: 'funko1',
  //   precio: 2,
  //   cantidad: 3,
  //   stock: 3,
  //   categoria,
  //   createdAt: new Date(155555),
  //   updatedAt: new Date(155555),
  //   isDeleted: false,
  // };

  const funkoResponse = {
    id: 1,
    nombre: 'funko1',
    imagen: 'funko1',
    precio: 2,
    cantidad: 3,
    stock: 3,
    categoria: 'DC',
    createdAt: new Date(155555),
    updatedAt: new Date(155555),
    isDeleted: false,
  };

  const createFunkoDto: CreateFunkoDto = {
    nombre: 'funko1',
    imagen: 'funko1',
    precio: 2,
    cantidad: 3,
    stock: 3,
    categoria: 'DC',
  };

  const productosServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [FunkosController],
      providers: [
        {
          provide: FunkosService,
          useValue: productosServiceMock,
        },
      ],
    }).compile();

    service = module.get<FunkosService>(FunkosService);
    controller = module.get<FunkosController>(FunkosController);
  });

  test('crea un funko', () => {
    jest.spyOn(service, 'create').mockResolvedValue(funkoResponse);

    expect(controller.create(createFunkoDto)).resolves.toEqual(funkoResponse);
  });

  describe('obtiene todos los funkos', () => {
    test('should get all Productos', async () => {
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

      jest.spyOn(service, 'findAll').mockResolvedValue(testFunkos);

      await expect(controller.findAll(paginateOptions)).resolves.toEqual(
        testFunkos,
      );
    });

    test('obtiene un funko', () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(funkoResponse);

      expect(controller.findOne('1')).resolves.toEqual(funkoResponse);
    });

    test('actualiza un funko', () => {
      jest.spyOn(service, 'update').mockResolvedValue(funkoResponse);

      expect(controller.update('1', createFunkoDto)).resolves.toEqual(
        funkoResponse,
      );
    });

    test('elimina un funko', () => {
      jest.spyOn(service, 'softRemove').mockResolvedValue(undefined);

      expect(controller.remove('1')).resolves.toEqual(undefined);
    });
  });
});
