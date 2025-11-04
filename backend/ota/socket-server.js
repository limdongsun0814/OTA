require("dotenv").config();
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.SOCKET_HOSTNAME;
const port = process.env.SOCKET_PORT;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url, true).pathname);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 10 * 1024 * 1024,
  });

  io.on("connection", (socket) => {
    console.log("Socket.IO 클라이언트 연결됨:", socket.id);
    socket.on("firmware", (msg) => {
      console.log("firmware 메시지:", msg);

      io.emit("firmware", msg);
    });
    socket.on("status", (msg) => {
      console.log("status 메시지:", msg);
      io.emit("status", msg);
    });
    socket.on("ip", (msg) => {
      console.log("ip 메시지:", msg);
      io.emit("ip", msg);
    });

    socket.on("disconnect", () => {
      console.log("클라이언트 연결 해제됨");
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
