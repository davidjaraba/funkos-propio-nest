import { Test, TestingModule } from '@nestjs/testing';
import { FunkoMapper } from './funko.mapper';
import { CreateFunkoDto } from '../dto/create-funko.dto';

describe('FunkoMapper', () => {
  let provider: FunkoMapper;

  const categoria = {
    id: '1',
    nombre: 'categoria1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: [],
  };

  const funko = {
    id: 1,
    nombre: 'funko1',
    imagen: 'funko1',
    precio: 2,
    cantidad: 3,
    stock: 3,
    categoria,
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FunkoMapper],
    }).compile();

    provider = module.get<FunkoMapper>(FunkoMapper);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });


});
