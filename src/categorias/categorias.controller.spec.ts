import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { CacheModule } from "@nestjs/cache-manager";

describe('CategoriasController', () => {
  let controller: CategoriasController;
  let service: CategoriasService;

  const categoriaResponse = {
    id: '1',
    nombre: 'categoria1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: [],
  };

  const createCategoriaDto = {
    nombre: 'categoria1',
  };

  const categoriasServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CategoriasController],
      providers: [
        {
          provide: CategoriasService,
          useValue: categoriasServiceMock,
        },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
    controller = module.get<CategoriasController>(CategoriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    test('should return a category', async () => {
      jest.spyOn(service, 'create').mockResolvedValueOnce(categoriaResponse);

      await expect(controller.create(createCategoriaDto)).resolves.toEqual(
        categoriaResponse,
      );
    });
  });

  describe('findAll', () => {
    test('should return an array of categories', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce([categoriaResponse]);

      await expect(controller.findAll()).resolves.toEqual([categoriaResponse]);
    });
  });

  describe('findOne', () => {
    test('should return a category', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(categoriaResponse);

      await expect(controller.findOne('1')).resolves.toEqual(categoriaResponse);
    });
  });

  describe('update', () => {
    test('should return a category', async () => {
      jest.spyOn(service, 'update').mockResolvedValueOnce(categoriaResponse);

      await expect(controller.update('1', createCategoriaDto)).resolves.toEqual(
        categoriaResponse,
      );
    });
  });

  describe('remove', () => {
    test('should return a category', async () => {
      jest.spyOn(service, 'removeSoft').mockResolvedValue(undefined);

      await expect(controller.remove('1')).resolves.toEqual(undefined);
    });
  });
});
