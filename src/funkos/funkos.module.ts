import { Module } from '@nestjs/common'
import { FunkosService } from './funkos.service'
import { FunkosController } from './funkos.controller'
import { Funko } from './entities/funko.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Categoria } from '../categorias/entities/categoria.entity'
import { FunkoMapper } from './mappers/funko.mapper'
import { StorageService } from '../storage/storage.service'
import { NotificationsGateway } from '../notifications/notifications.gateway'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([Funko, Categoria]),
  ],
  controllers: [FunkosController],
  providers: [FunkosService, FunkoMapper, StorageService, NotificationsGateway],
})
export class FunkosModule {}
