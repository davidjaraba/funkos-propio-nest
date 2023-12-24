import { PartialType } from '@nestjs/mapped-types'
import { CreateFunkoDto } from './create-funko.dto'

export class ResponseFunkoDto extends PartialType(CreateFunkoDto) {
  id: number
  nombre: string
  precio: number
  categoria: string
  cantidad: number
  imagen: string
  stock: number
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}
