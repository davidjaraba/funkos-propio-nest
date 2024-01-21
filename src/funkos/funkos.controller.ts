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
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { Roles, RolesAuthGuard } from '../auth/guards/roles-auth.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@UseInterceptors(CacheInterceptor)
@Controller('v1/funkos')
export class FunkosController {
  constructor(private readonly funkosService: FunkosService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  create(@Body() createFunkoDto: CreateFunkoDto) {
    return this.funkosService.create(createFunkoDto)
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.funkosService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funkosService.findOne(+id)
  }

  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  @Put(':id')
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
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.funkosService.softRemove(+id)
  }

  @UseGuards(JwtAuthGuard, RolesAuthGuard) // Aplicar el guard aquí
  @Roles('ADMIN')
  @UseGuards(FunkoExistsGuard)
  @Patch('/imagen/:id')
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
