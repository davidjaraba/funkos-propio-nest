import { Test, TestingModule } from '@nestjs/testing';
import { FunkosService } from './funkos.service';
import { Repository } from 'typeorm'
import { Funko } from './entities/funko.entity'
import { FunkoMapper } from './mappers/funko.mapper'
import { Categoria } from '../categorias/entities/categoria.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ResponseFunkoDto } from './dto/response-funko.dto'
import { NotFoundException } from '@nestjs/common'
import { ResponseCategoriaDto } from '../categorias/dto/response-categoria.dto'
import { CreateFunkoDto } from './dto/create-funko.dto'

describe('FunkosService', () => {
  let service: FunkosService;
  let funkoRepo: Repository<Funko>
  let mapper: FunkoMapper
  let categoriaRepo: Repository<Categoria>

  let funkosToTest: Funko[] = [
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
        funkos: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
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
        funkos: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    }
  ]

  const funkoMapper = {

    toFunko: jest.fn(),
    toFunkoResponse: jest.fn()

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkosService,
        {provide: getRepositoryToken(Funko), useClass: Repository},
        {provide: getRepositoryToken(Categoria), useClass: Repository},
        {provide: FunkoMapper, useValue: funkoMapper}
      ],
    }).compile();

    mapper = module.get<FunkoMapper>(FunkoMapper)
    funkoRepo = module.get(getRepositoryToken(Funko))
    service = module.get<FunkosService>(FunkosService);
    categoriaRepo = module.get(getRepositoryToken(Categoria))
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {

    test('devuelve todos los productos', async ()=> {

      const mockQueryBuilder = {

        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockReturnValue(funkosToTest),
        leftJoinAndSelect: jest.fn().mockReturnThis()

      }

      jest.spyOn(mapper, 'toFunkoResponse').mockReturnValue(new ResponseFunkoDto())

      jest.spyOn(funkoRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any)

      const res: any = await service.findAll()

      expect(res).toEqual([new ResponseFunkoDto(), new ResponseFunkoDto()])
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('isDeleted = :isDeleted', {isDeleted: false})
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('funko.categoria', 'categoria')
      expect(mockQueryBuilder.getMany).toHaveBeenCalled()


    })

  })

  describe('findOne', () => {

    test('devuelve un producto que tenga la id', async ()=> {

      const mockQueryBuilder = {

        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis()

      }

      jest.spyOn(mapper, 'toFunkoResponse').mockReturnValue(new ResponseFunkoDto())

      jest.spyOn(funkoRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any)


      const res: any = await service.findOne(1)

      expect(res).toEqual(new ResponseFunkoDto())
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('isDeleted = :isDeleted and funko.id = :id', {isDeleted: false, id: 1})
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('funko.categoria', 'categoria')
      expect(mockQueryBuilder.getOne).toHaveBeenCalled()

    })

  })

  describe('findOneNotFound', () => {

    test('devuelve un producto que tenga la id sin encontrarlo', async ()=> {


      const mockQueryBuilder = {

        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(null),
        leftJoinAndSelect: jest.fn().mockReturnThis()

      }

      // tiene que devolver una excepcion
      jest.spyOn(mapper, 'toFunkoResponse').mockReturnValue(new ResponseFunkoDto())

      jest.spyOn(funkoRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any)


      await expect(
        async () => {
          await service.findOne(1)
        }).rejects.toThrow(NotFoundException)

    })

  })


  describe('create', () => {

    test('crea un producto', async () => {

      const mockResponseFunkoDto = new ResponseFunkoDto()

      jest.spyOn(categoriaRepo, 'findOneBy').mockResolvedValue(new Categoria())

      jest.spyOn(mapper, 'toFunko').mockReturnValue(new Funko())

      jest.spyOn(funkoRepo, 'save').mockResolvedValue(new Funko())

      jest.spyOn(mapper, 'toFunkoResponse').mockReturnValue(mockResponseFunkoDto)

      expect(await service.create(new CreateFunkoDto())).toEqual(
        mockResponseFunkoDto,
      );

      expect(mapper.toFunkoResponse).toHaveBeenCalled()
      expect(funkoRepo.save).toHaveBeenCalled()

    });
  })


  describe('update', ()=> {

    test('actualiza un funko', async ()=>{

      const mockResponseFunkoDto = new ResponseFunkoDto()

      const mockQueryBuilder = {

        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis()

      }

      jest.spyOn(funkoRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(categoriaRepo, 'findOneBy').mockResolvedValue(new Categoria())

      jest.spyOn(mapper, 'toFunko').mockReturnValue(new Funko())

      jest.spyOn(funkoRepo, 'save').mockResolvedValue(new Funko())

      jest.spyOn(mapper, 'toFunkoResponse').mockReturnValue(mockResponseFunkoDto)

      expect(await service.update(1, new CreateFunkoDto())).toEqual(
        mockResponseFunkoDto,
      );

      expect(mapper.toFunkoResponse).toHaveBeenCalled()
      expect(funkoRepo.save).toHaveBeenCalled()

    })

  })

  describe('remove', ()=> {

    test('elimina un funko', ()=>  {

      const mockQueryBuilder = {

        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis()

      }

      jest.spyOn(funkoRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any)

      jest.spyOn(funkoRepo, 'delete').mockResolvedValue(
        {
        affected: 1,
          raw: []
        }
      )

      expect(service.remove(1)).resolves.toEqual(
        {
          affected: 1,
          raw: []
        }
      )

    })
  })


  describe('removeSoft', ()=> {

    test('elimina un funko mediante borrado logico', async ()=>  {

      const mockQueryBuilder = {

        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined)

      }

      jest.spyOn(funkoRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any)

      expect(await service.softRemove(1)).toBeUndefined()

    })

  })



});
