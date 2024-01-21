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

@UseInterceptors(CacheInterceptor)
@Controller('v1/categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return await this.categoriasService.create(createCategoriaDto)
  }

  @Get()
  async findAll() {
    return this.categoriasService.findAll()
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.findOne(id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, updateCategoriaDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriasService.removeSoft(id)
  }
}
