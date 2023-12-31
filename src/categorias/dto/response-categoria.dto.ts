import { Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Funko } from '../../funkos/entities/funko.entity'

export class ResponseCategoriaDto {

  id: string

  nombre: string

  createdAt: Date

  updatedAt: Date

  isDeleted: boolean

  funkos: Funko[]

}
