import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { ResponseCategoriaDto } from '../../src/categorias/dto/response-categoria.dto';
import { CreateCategoriaDto } from '../../src/categorias/dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../../src/categorias/dto/update-categoria.dto';
import { CategoriasController } from '../../src/categorias/categorias.controller';
import { CategoriasService } from '../../src/categorias/categorias.service';

describe('CategoriaController (e2e)', () => {
  let app: INestApplication;

  const myEndpoint = '/v1/categorias';

  const categoriasToTest: ResponseCategoriaDto[] = [
    {
      id: 'cbaafc73-db86-4848-a9d0-b0d49801f221',
      nombre: 'categoria1',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      funkos: [],
    },
    {
      id: 'cbaafc73-db86-4848-a9d0-b0d49801f221',
      nombre: 'categoria2',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
      funkos: [],
    },
  ];

  const createCategoriaDto: CreateCategoriaDto = {
    nombre: 'categoria1',
  };

  const updateCategoriaDto: UpdateCategoriaDto = {
    nombre: 'categoria1',
  };

  const mockCategoriasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [
        CategoriasService,
        { provide: CategoriasService, useValue: mockCategoriasService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('GET /categorias', () => {
    it('devuelve todas las categorias', async () => {
      mockCategoriasService.findAll.mockResolvedValue(categoriasToTest);

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}`)
        .expect(200);
      expect(() => {
        expect(body).toEqual(categoriasToTest);
        expect(mockCategoriasService.findAll).toHaveBeenCalled();
      });
    });
  });

  describe('GET /categorias/:id', () => {
    it('devuelve una categoria por la id', async () => {
      mockCategoriasService.findOne.mockResolvedValue(categoriasToTest[0]);

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${categoriasToTest[0].id}`)
        .expect(200);
      expect(() => {
        expect(body).toEqual(categoriasToTest[0]);
        expect(mockCategoriasService.findOne).toHaveBeenCalled();
      });
    });

    it('devuelve 404 si no encuentra la categoria', async () => {
      mockCategoriasService.findOne.mockRejectedValue(new NotFoundException());

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${categoriasToTest[0].id}`)
        .expect(404);
    });
  });

  describe('POST /categorias', () => {
    it('crea una categoria', async () => {
      mockCategoriasService.create.mockResolvedValue(categoriasToTest[0]);

      const { body } = await request(app.getHttpServer())
        .post(`${myEndpoint}`)
        .send(createCategoriaDto)
        .expect(201);
      expect(() => {
        expect(body).toEqual(categoriasToTest[0]);
        expect(mockCategoriasService.create).toHaveBeenCalled();
      });
    });
  });

  describe('PUT /categorias/:id', () => {
    it('actualiza una categoria', async () => {
      mockCategoriasService.update.mockResolvedValue(categoriasToTest[0]);

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${categoriasToTest[0].id}`)
        .send(updateCategoriaDto)
        .expect(200);
      expect(() => {
        expect(body).toEqual(categoriasToTest[0]);
        expect(mockCategoriasService.update).toHaveBeenCalled();
      });
    });
  });

  describe('DELETE /categorias/:id', () => {
    it('borra una categoria', async () => {
      mockCategoriasService.removeSoft.mockResolvedValue(categoriasToTest[0]);

      const { body } = await request(app.getHttpServer())
        .delete(`${myEndpoint}/${categoriasToTest[0].id}`)
        .expect(200);
      expect(() => {
        expect(body).toEqual(categoriasToTest[0]);
        expect(mockCategoriasService.removeSoft).toHaveBeenCalled();
      });
    });
  });
});
