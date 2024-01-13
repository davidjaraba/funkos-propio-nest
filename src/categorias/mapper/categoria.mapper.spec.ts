import { Test, TestingModule } from '@nestjs/testing'
import { CategoriaMapper } from './categoria.mapper'
import { Categoria } from '../entities/categoria.entity'
import { ResponseCategoriaDto } from '../dto/response-categoria.dto'

describe('Mapper', () => {
  let provider: CategoriaMapper

  const categoriaToTest: Categoria = {
    id: '1',
    nombre: 'categoria1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: [],
  }

  const categoriaToResponseDto: ResponseCategoriaDto = {
    id: '1',
    nombre: 'categoria1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    funkos: [],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriaMapper],
    }).compile()

    provider = module.get<CategoriaMapper>(CategoriaMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  describe('toResponseDto', () => {
    test('devuelve la categoria mapeada a un ResponseCategoriaDto', () => {
      const res: any = provider.toResponseDto(categoriaToTest)

      expect(res).toEqual(categoriaToResponseDto)
    })
  })
})
