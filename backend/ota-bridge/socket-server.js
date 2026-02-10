require("dotenv").config();
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.SOCKET_HOSTNAME;
const port = process.env.SOCKET_PORT;

const io = new Server(port, {
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
