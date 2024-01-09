import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from "@nestjs/websockets";
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Notificacion } from "./entities/notification.entity";
import { Server, Socket } from 'socket.io'
import { Logger } from "@nestjs/common";
import { ResponseFunkoDto } from "../funkos/dto/response-funko.dto";
import { ResponseCategoriaDto } from "../categorias/dto/response-categoria.dto";
import { Funko } from "../funkos/entities/funko.entity";

const ENDPOINT: string = `/ws`

@WebSocketGateway({
  namespace: ENDPOINT,
})
export class NotificationsGateway {
  @WebSocketServer()
  private server: Server

  private readonly logger = new Logger(NotificationsGateway.name)

  constructor() {
    this.logger.log(`ProductsNotificationsGateway is listening on ${ENDPOINT}`)
  }

  sendMessage(
    notification: Notificacion<ResponseFunkoDto | ResponseCategoriaDto>,
  ) {
    if (notification instanceof Funko){
      this.server.emit('funkosUpdates', notification)
    } else this.server.emit('categoriasUpdates', notification);
  }

  // Si quiero leer lo que llega y reenviarlo
  /*@SubscribeMessage('updateProduct')
  handleUpdateProduct(client: Socket, data: any) {
    // Aquí puedes manejar la lógica para procesar la actualización del producto
    // y enviar la notificación a todos los clientes conectados
    const notification = {
      message: 'Se ha actualizado un producto',
      data: data,
    }

    this.server.emit('updates', notification)
  }*/

  private handleConnection(client: Socket) {
    // Este método se ejecutará cuando un cliente se conecte al WebSocket
    this.logger.debug('Cliente conectado:', client.id)
    this.server.emit(
      'connection',
      'Updates Notifications WS: Productos - Tienda API NestJS',
    )
  }

  private handleDisconnect(client: Socket) {
    // Este método se ejecutará cuando un cliente se desconecte del WebSocket
    console.log('Cliente desconectado:', client.id)
    this.logger.debug('Cliente desconectado:', client.id)
  }
}
