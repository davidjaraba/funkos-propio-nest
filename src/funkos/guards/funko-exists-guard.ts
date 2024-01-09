import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { Observable } from "rxjs";
import {FunkosService} from "../funkos.service";

@Injectable()
export class FunkoExistsGuard implements CanActivate {

  constructor(private readonly funkoService: FunkosService) {
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()

    const funkoId = parseInt(request.params.id, 10)

    if (isNaN(funkoId)){
      throw new BadRequestException('El id es invalido')
    }

    return this.funkoService.findOne(funkoId).then((fk) => {
      if (!fk){
        throw new NotFoundException('Funko no encontrado')
      }
      return true
    })

  }



}