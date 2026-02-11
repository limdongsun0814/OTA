import { io } from "socket.io-client";
import MqttPublish, { uploadTopic, UPLOAD_DIR } from "./uploadMqtt";
import executeQuery from "./db";
("../_lib/db");
import fs from "fs/promises";

export default async function uploadFirmware(
  fileName: string,
  chipIds: string[],
) {
  const socketHostname = process.env.SOCKET_HOSTNAME;
  const socketPort = process.env.SOCKET_PORT;
  const socket = io(`http://${socketHostname}:${socketPort}`);
  const fileBuffer = await fs.readFile(fileName);
  const uint8Array = new Uint8Array(fileBuffer);
  const fileBlob = new Blob([uint8Array]);
  const formData = new FormData();
  formData.append("upload", fileBlob);

  const socketData: { [key: string]: string } = {};
  for (let index in chipIds) {
    socketData[chipIds[index]] = "waiting";
  }
  console.log(socketData, "socketData");
  const addresses = await executeQuery(
    `select ip, chip_id from mcu where chip_id in(?)`,
    chipIds,
  );
  executeQuery(
    "update mcu set status = 'waiting' where chip_id in(?) ",
    chipIds,
  );

  socket.emit("status", socketData);
  for (const address of addresses[0]) {
    console.log(address.ip, "http://" + address.ip + "/update", fileBlob);
    executeQuery(
      "update mcu set status = 'uploading' where ip = ?",
      address.ip,
    );
    socket.emit("status", { [address.chip_id]: "uploading" });
    fetch("http://" + address.ip + "/update", {
      method: "POST",
      body: formData,
      headers: {
        Connection: "close",
        /* MCU가 리셋 후 TCP 연결이 끊어졌음에도 불구하고, 재사용하다 에러 발생
        [TypeError: fetch failed] {
        [cause]: [Error: write ECONNRESET] {
          errno: -4077,
          code: 'ECONNRESET',
          syscall: 'write'
        }
      }
    */
      },
    })
      .then((data) => {
        executeQuery(
          "update mcu set status = 'restart' where ip = ?",
          address.ip,
        );
        socket.emit("status", { [address.chip_id]: "restart" });
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
