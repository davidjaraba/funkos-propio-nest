import {
  Column,
  CreateDateColumn, Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Funko } from '../../funkos/entities/funko.entity'

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, unique: true })
  nombre: string

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean

  @OneToMany(() => Funko, (funko) => funko.categoria)
  funkos: Funko[]
}