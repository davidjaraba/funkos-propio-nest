import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Categoria } from '../../categorias/entities/categoria.entity'

@Entity('funkos')
export class Funko {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar', { length: 50 })
  nombre: string

  @Column('decimal', { precision: 5, scale: 2 })
  precio: number

  @ManyToOne(() => Categoria, (categoria) => categoria.funkos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria

  @Column('int')
  cantidad: number

  @Column('varchar', { length: 100, nullable: true })
  imagen?: string

  @Column('int')
  stock: number

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

  @Column('boolean', { name: 'isdeleted', default: false })
  isDeleted: boolean
}