import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';

@WebSocketGateway({ cors: 'localhost:3000' }) //
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly socketService: SocketService) {}

  afterInit() {
    this.socketService.setServer(this.server);
  }

  send(event: string, data: any) {
    this.server.emit(event, data);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): string {
    console.log(data);
    client.broadcast.emit('message', data);
    return 'Hello world!';
  }

  @SubscribeMessage('firmware')
  handleTest1(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    console.log(data);
    client.broadcast.emit('firmware', data);
  }
  @SubscribeMessage('status')
  handleTest2(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    console.log(data);
    client.broadcast.emit('status', data);
  }
  @SubscribeMessage('ip')
  handleTest3(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    console.log(data);
    client.broadcast.emit('ip', data);
  }
}
