import { PartialType } from '@nestjs/mapped-types'
import { CreateFunkoDto } from './create-funko.dto'

export class ResponseFunkoDto extends PartialType(CreateFunkoDto) {
  id: number
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}
