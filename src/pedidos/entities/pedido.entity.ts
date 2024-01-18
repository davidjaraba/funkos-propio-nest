import { Column, CreateDateColumn, Entity, ObjectIdColumn, UpdateDateColumn } from "typeorm";
import { ObjectId } from "mongodb";

export class Direccion {

  @Column('varchar', { length: 100, nullable: true })
  calle: string

  @Column('int')
  numero: string

  @Column('varchar', { length: 100, nullable: true })
  ciudad: string

  @Column('varchar', { length: 100, nullable: true })
  provincia: string

  @Column('varchar', { length: 100, nullable: true })
  pais: string

  @Column('int')
  codigoPostal: string
}

export class Cliente {

  @Column('varchar', { length: 100, nullable: true })
  nombreCompleto: string

  @Column('varchar', { length: 100, nullable: true })
  email: string

  @Column('varchar', { length: 10, nullable: true })
  telefono: string

  @Column('varchar', { length: 100, nullable: true })
  direccion: Direccion
}

export class LineaPedido {

  @Column()
  idProducto: number

  @Column()
  precioProducto: number

  @Column()
  cantidad: number

  @Column()
  total: number
}

// Nuestro documento de la base de datos para poder usarlo en el servicio
// y en el controlador, lo usaremos para mapear los datos de la base de datos
export type PedidoDocument = Pedido & Document

// El esquema de la base de datos
// @Schema({
//   collection: 'pedidos', // Nombre de la colección en la base de datos
//   timestamps: false, // No queremos que se añadan los campos createdAt y updatedAt, los añadimos nosotros
//   // Este método toJSON se ejecutará cada vez que se llame a JSON.stringify() en un documento de Mongoose
//   // mapea el _id a id y elimina __v y _id cuando se llama a JSON.stringify()
//   versionKey: false,
//   id: true,
//   toJSON: {
//     virtuals: true,
//     // Aquí añadimos el método toJSON
//     transform: (doc, ret) => {
//       delete ret.__v // Eliminamos el campo __v
//       ret.id = ret._id // Mapeamos el _id a id
//       delete ret._id // Eliminamos el _id
//       delete ret._class // Esto es por si usamos discriminadores
//     },
//   },
// })
// Nuestra clase principal (esquema)!!
// Definimos con @Prop() cada uno de los campos de la colección

@Entity()
export class Pedido {


  @ObjectIdColumn()
  id: ObjectId

  @Column()
  idUsuario: number

  @Column((type) => Cliente)
  cliente: Cliente

  @Column((type) => LineaPedido)
  lineasPedido: LineaPedido[]

  @Column()
  totalItems: number

  @Column()
  total: number

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