import { NextResponse } from "next/server";
import executeQuery from "../_lib/db";
import { io } from "socket.io-client";

export async function POST(request: Request) {
  const data = await request.json();
  const { chipId, ip } = data;
  console.log(chipId, ip);
  executeQuery("update mcu set ip = ? , status = 'start' where chip_id = ? ", [
    ip,
    chipId,
  ]);

  const socketHostname = process.env.SOCKET_HOSTNAME;
  const socketPort = process.env.SOCKET_PORT;
  const socket = io(`http://${socketHostname}:${socketPort}`);
  socket.emit("status", { [chipId]: "start" });
  socket.emit("ip", { [chipId]: ip });

  return NextResponse.json({ send: "ok" });
}
