import { Test, TestingModule } from '@nestjs/testing';
import { CategoriaMapper } from './categoria.mapper';

describe('Mapper', () => {
  let provider: CategoriaMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriaMapper],
    }).compile();

    provider = module.get<CategoriaMapper>(CategoriaMapper);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
