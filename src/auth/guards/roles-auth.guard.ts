import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesAuthGuard implements CanActivate {
  private readonly logger = new Logger(RolesAuthGuard.name)

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    this.logger.log(`Roles: ${roles}`)
    if (!roles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const user = request.user
    this.logger.log(`User roles: ${user.roles}`)
    // Al menos tenga un rol de los requeridos!!
    const hasRole = () => user.roles.some((role) => roles.includes(role))
    return user && user.roles && hasRole()
  }
}

/*
SetMetadata es una función proporcionada por NestJS que te permite agregar metadatos personalizados
a los manejadores de ruta. Estamos creando una nueva función, Roles, que toma una lista de roles
y utiliza SetMetadata para agregarlos como metadatos al manejador de ruta.
Podrás poner los roles requeridos en la ruta usando el decorador @Roles.
 */
// El decorador
export const Roles = (...roles: string[]) => SetMetadata('roles', roles)
