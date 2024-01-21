import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
  ParseUUIDPipe,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common'
import { CategoriasService } from './categorias.service'
import { CreateCategoriaDto } from './dto/create-categoria.dto'
import { UpdateCategoriaDto } from './dto/update-categoria.dto'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { Paginated } from 'nestjs-paginate'
import { ResponseFunkoDto } from '../funkos/dto/response-funko.dto'
import { CreateFunkoDto } from '../funkos/dto/create-funko.dto'
import { UpdateFunkoDto } from '../funkos/dto/update-funko.dto'

@UseInterceptors(CacheInterceptor)
@Controller('v1/categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 201,
    description: 'Funko creado',
    type: ResponseFunkoDto,
  })
  @ApiBody({
    description: 'Datos del producto a crear',
    type: CreateFunkoDto,
  })
  @ApiBadRequestResponse({
    description:
      'El algunos de los campos no es válido según la especificación del DTO',
  })
  @ApiBadRequestResponse({
    description: 'La categoría no existe o no es válida',
  })
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return await this.categoriasService.create(createCategoriaDto)
  }

  @Get()
  @ApiResponse({
    status: 200,
    description:
      'Lista de funkos paginada. Se puede filtrar por limite, pagina sortBy, filter y search',
    type: Paginated<ResponseFunkoDto>,
  })
  @ApiQuery({
    description: 'Filtro por limite por pagina',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro por pagina',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filtro de ordenación: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: filter.campo = $eq:valor',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filtro de busqueda: search = valor',
    name: 'search',
    required: false,
    type: String,
  })
  async findAll() {
    return this.categoriasService.findAll()
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: ResponseFunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del producto',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del producto no es válido',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.findOne(id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado',
    type: ResponseFunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del producto',
    type: Number,
  })
  @ApiBody({
    description: 'Datos del producto a actualizar',
    type: UpdateFunkoDto,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  @ApiBadRequestResponse({
    description:
      'El algunos de los campos no es válido según la especificación del DTO',
  })
  @ApiBadRequestResponse({
    description: 'La categoría no existe o no es válida',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, updateCategoriaDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 204,
    description: 'Funko eliminado',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del producto',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Funko no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del funko no es válido',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.removeSoft(id)
  }
}
