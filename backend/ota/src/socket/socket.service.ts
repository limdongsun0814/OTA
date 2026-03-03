import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private server: Server;
  setServer(server: Server) {
    this.server = server;
  }
  send(event: string, data: any) {
    this.server?.emit(event, data);
  }
}
