import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import * as path from 'path'
import { getSSLOptions } from './config/ssl/ssl.config'
import { setupSwagger } from './config/swagger/swagger.config'

async function bootstrap() {
  // Mostramos el modo de la aplicación
  if (process.env.NODE_ENV === 'dev') {
    console.log('🛠️ Iniciando Nestjs Modo desarrollo 🛠️')
  } else {
    console.log('🚗 Iniciando Nestjs Modo producción 🚗')
  }

  // Obtener las opciones de SSL
  const httpsOptions = getSSLOptions()

  // Inicialización de la aplicación
  const app = await NestFactory.create(AppModule, { httpsOptions })

  // Configuración de la versión de la API
  // app.setGlobalPrefix(process.env.API_VERSION || 'v1')

  // Configuración de Swagger solo en modo desarrollo
  if (process.env.NODE_ENV === 'dev') {
    setupSwagger(app)
  }
  // Activamos las validaciones body y dtos
  app.useGlobalPipes(new ValidationPipe())

  // Configuración del puerto de escucha
  await app.listen(process.env.API_PORT || 3000)
}
bootstrap().then(() =>
  console.log(
    `🟢 Servidor escuchando en puerto: ${
      process.env.API_PORT || 3000
    } y perfil: ${process.env.NODE_ENV} 🚀`,
  ),
)
