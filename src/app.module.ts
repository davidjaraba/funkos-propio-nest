import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { FunkosModule } from './funkos/funkos.module'
import { CategoriasModule } from './categorias/categorias.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StorageModule } from './storage/storage.module'
import { NotificationsModule } from './notifications/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [
    CacheModule.register(),
    FunkosModule,
    CategoriasModule,
    TypeOrmModule.forRoot({
      type: 'postgres', // Tipo de base de datos
      host: 'localhost', // Dirección del servidor
      port: 5432, // Puerto del servidor
      username: 'appAdmin', // Nombre de usuario
      password: 'supersecure', // Contraseña de usuario
      database: 'NEST_DB', // Nombre de la base de datos
      entities: [`${__dirname}/**/*.entity{.ts,.js}`], // Entidades de la base de datos (buscar archivos con extensión .entity.ts o .entity.js)
      synchronize: true, // Sincronizar la base de datos
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb', // Tipo de base de datos
      host: 'localhost', // Dirección del servidor
      port: 27017, // Puerto del servidor
      username: 'appAdmin', // Nombre de usuario
      password: 'supersecure', // Contraseña de usuario
      database: 'NEST_DB', // Nombre de la base de datos
      entities: [`${__dirname}/**/*.entity{.ts,.js}`], // Entidades de la base de datos (buscar archivos con extensión .entity.ts o .entity.js)
      synchronize: true, // Sincronizar la base de datos
    }),
    StorageModule,
    NotificationsModule,
    PedidosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
