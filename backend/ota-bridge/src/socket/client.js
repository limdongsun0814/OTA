require("dotenv").config();

const { Server } = require("socket.io");

class Socket {
  static io;

  static init(port) {
    if (!Socket.io) {
      Socket.io = new Server(port, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
        maxHttpBufferSize: 10 * 1024 * 1024,
      });
    }
    return Socket.io;
  }
}

module.exports = Socket;
