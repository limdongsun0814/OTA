import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private server: Server;
  constructor() {}
  setServer(server: Server) {
    this.server = server;
  }
  send(event: string, data: any) {
    console.log('🔥 실제 emit:', event, data);
    console.log('현재 연결 수:', this.server?.engine?.clientsCount);
    this.server?.emit(event, data);
  }
}
