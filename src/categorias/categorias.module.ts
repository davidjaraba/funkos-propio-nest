import { Module } from '@nestjs/common'
import { CategoriasService } from './categorias.service'
import { CategoriasController } from './categorias.controller'
import { Categoria } from './entities/categoria.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoriaMapper } from './mapper/categoria.mapper'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsGateway } from '../notifications/notifications.gateway'

@Module({
  imports: [CacheModule.register(), TypeOrmModule.forFeature([Categoria])],
  controllers: [CategoriasController],
  providers: [CategoriasService, CategoriaMapper, NotificationsGateway],
})
export class CategoriasModule {}
