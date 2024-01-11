import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { FunkosController } from '../../src/funkos/funkos.controller';
import { FunkosService } from '../../src/funkos/funkos.service';
import { ResponseFunkoDto } from '../../src/funkos/dto/response-funko.dto';
import { CreateFunkoDto } from '../../src/funkos/dto/create-funko.dto';
import { UpdateFunkoDto } from '../../src/funkos/dto/update-funko.dto';
import { CacheModule } from "@nestjs/cache-manager";

describe('FunkoController (e2e)', () => {
  let app: INestApplication;

  const myEndpoint = '/v1/funkos';

  const funkosToTest: ResponseFunkoDto[] = [
    {
      id: 1,
      nombre: 'funko1',
      imagen: 'funko1',
      precio: 2,
      cantidad: 3,
      stock: 3,
      categoria: 'DC',
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
      categoria: 'MARVEL',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ];

  const createFunkoDto: CreateFunkoDto = {
    nombre: 'funko1',
    imagen: 'funko1',
    precio: 2,
    cantidad: 3,
    stock: 3,
    categoria: 'DC',
  };

  const updateFunkoDto: UpdateFunkoDto = {
    nombre: 'funko1',
    imagen: 'funko1',
  };

  const mockFunkosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    updateImage: jest.fn()
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [FunkosController],
      providers: [
        FunkosService,
        { provide: FunkosService, useValue: mockFunkosService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('GET /funkos', () => {
    it('devuelve todos los funkos', async () => {
      mockFunkosService.findAll.mockResolvedValue(funkosToTest);

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}`)
        .expect(200);
      expect(() => {
        expect(body).toEqual(funkosToTest);
        expect(mockFunkosService.findAll).toHaveBeenCalled();
      });
    });
  });

  describe('GET /funkos/:id', () => {
    it('devuelve el funko con id', async () => {
      mockFunkosService.findOne.mockResolvedValue(funkosToTest[0]);

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${funkosToTest[0].id}`)
        .expect(200);
      expect(() => {
        expect(body).toEqual(funkosToTest[0]);
        expect(mockFunkosService.findOne).toHaveBeenCalled();
      });
    });

    it('devuelve 404 al no haber encontrado', async () => {
      mockFunkosService.findOne.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${funkosToTest[0].id}`)
        .expect(404);
    });
  });

  describe('POST /funkos', () => {
    test('crea un funko', async () => {
      mockFunkosService.create.mockResolvedValue(funkosToTest[0]);

      const { body } = await request(app.getHttpServer())
        .post(`${myEndpoint}`)
        .send(createFunkoDto)
        .expect(201);
      expect(() => {
        expect(body).toEqual(funkosToTest[0]);
        expect(mockFunkosService.create).toHaveBeenCalled();
      });
    });
  });

  describe('PUT /funkos/:id', () => {
    test('actualiza un funko existente', async () => {
      mockFunkosService.update.mockResolvedValue(funkosToTest[1]);

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${funkosToTest[1].id}`)
        .send(updateFunkoDto)
        .expect(200);
      expect(() => {
        expect(body).toEqual(funkosToTest[1]);
        expect(mockFunkosService.update).toHaveBeenCalled();
      });
    });
  });

  describe('DELETE /funkos/:id', () => {
    test('elimina un funko, por borrado logico', async () => {
      mockFunkosService.softRemove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${funkosToTest[1].id}`)
        .expect(204);
      expect(() => {
        expect(mockFunkosService.softRemove).toHaveBeenCalled();
      });
    });
  });

  describe('UPDATE /funkos/:id', ()=>{

    test('actualiza una imagen', async () => {

      const file = Buffer.from('file')

      mockFunkosService.updateImage.mockResolvedValue(funkosToTest[0])

      mockFunkosService.findOne.mockResolvedValue(funkosToTest[0])

      await request(app.getHttpServer())
        .patch(`${myEndpoint}/imagen/${funkosToTest[0].id}`)
        .attach('file', file, 'image.jpg')
        .set('Content-Type', 'multipart/form-data')
        .expect(200)

    });
  })
});
