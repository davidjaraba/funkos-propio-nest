import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

// Para evitar que un endpint salga: @ApiExcludeController() // Excluir el controlador de Swagger

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST Tienda Nestjs DAW 2023/2024')
    .setDescription(
      'API de ejemplo del curso Desarrollo de un API REST con Nestjs para 2º DAW. 2023/2024',
    )
    .setContact(
      'José Luis González Sánchez',
      'https://joseluisgs.dev',
      'joseluis.gonzalez@iesluisvives.org',
    )
    .setExternalDoc('Documentación de la API', 'https://github.com/davidjaraba')
    .setLicense('CC BY-NC-SA 4.0', 'https://w.dev/docs/license/')
    .setVersion('1.0.0')
    .addTag('Funkos', 'Operaciones con productos')
    .addTag('Storage', 'Operaciones con almacenamiento')
    .addTag('Auth', 'Operaciones de autenticación')
    .addBearerAuth() // Añadimos el token de autenticación
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document) // http://localhost:3000/api
}
