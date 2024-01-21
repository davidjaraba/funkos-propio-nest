import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Put,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { FunkosService } from './funkos.service'
import { CreateFunkoDto } from './dto/create-funko.dto'
import { UpdateFunkoDto } from './dto/update-funko.dto'
import { FunkoExistsGuard } from './guards/funko-exists-guard'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, parse } from 'path'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { ResponseFunkoDto } from './dto/response-funko.dto'

@UseInterceptors(CacheInterceptor)
@Controller('v1/funkos')
export class FunkosController {
  constructor(private readonly funkosService: FunkosService) {}

  @Post()
  @HttpCode(201)
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
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkosService.create(createFunkoDto)
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
  findAll(@Paginate() query: PaginateQuery) {
    return this.funkosService.findAll(query)
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
  findOne(@Param('id') id: string) {
    return this.funkosService.findOne(+id)
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
    @Param('id', ParseIntPipe) id: string,
    @Body() updateFunkoDto: UpdateFunkoDto,
  ) {
    return this.funkosService.update(+id, updateFunkoDto)
  }

  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  @Delete(':id')
  @HttpCode(204)
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
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.funkosService.softRemove(+id)
  }

  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  @UseGuards(FunkoExistsGuard)
  @Patch('/imagen/:id')
  @ApiBearerAuth() // Indicar que se requiere autenticación con JWT en Swagger
  @ApiResponse({
    status: 200,
    description: 'Imagen actualizada',
    type: ResponseFunkoDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador del producto',
    type: Number,
  })
  @ApiProperty({
    name: 'file',
    description: 'Fichero de imagen',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichero de imagen',
    type: FileInterceptor('file'),
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'El id del producto no es válido',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no es válido o de un tipo no soportado',
  })
  @ApiBadRequestResponse({
    description: 'El fichero no puede ser mayor a 1 megabyte',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          // const fileName = uuidv4() // usamos uuid para generar un nombre único para el archivo
          const { name } = parse(file.originalname)
          const fileName = `${Date.now()}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname) // extraemos la extensión del archivo
          cb(null, `${fileName}${fileExt}`) // llamamos al callback con el nombre del archivo
        },
      }),
      // Validación de archivos
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024 // 1 megabyte
        if (!allowedMimes.includes(file.mimetype)) {
          // Note: You can customize this error message to be more specific
          cb(
            new BadRequestException(
              'Fichero no soportado. No es del tipo imagen válido',
            ),
            false,
          )
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException(
              'El tamaño del archivo no puede ser mayor a 1 megabyte.',
            ),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return await this.funkosService.updateImage(id, file, req)
  }
}
