require("dotenv").config();

class SocketHandler {
  #server;
  constructor(server) {
    this.#server = server;
    this.setup();
  }
  setup() {
    this.#server.on("connection", (socket) => {
      console.log("Socket.IO 클라이언트 연결됨:", socket.id);

      socket.on("firmware", (msg) => {
        console.log("firmware 메시지:", msg);
        this.#server.emit("firmware", msg);
      });
      socket.on("status", (msg) => {
        console.log("status 메시지:", msg);
        this.#server.emit("status", msg);
      });
      socket.on("ip", (msg) => {
        console.log("ip 메시지:", msg);
        this.#server.emit("ip", msg);
      });

      socket.on("disconnect", () => {
        console.log("클라이언트 연결 해제됨");
      });
    });
  }
}

module.exports = SocketHandler;
