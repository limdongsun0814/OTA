import mqtt from "mqtt";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";
import executeQuery from "./db";
import { io } from "socket.io-client";

const seedrandom = require("seedrandom");
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || "");

async function MqttPublish(topic: string, fileName: string, chipIds: string[]) {
  const socketHostname = process.env.SOCKET_HOSTNAME;
  const socketPort = process.env.SOCKET_PORT;
  const socket = io(`http://${socketHostname}:${socketPort}`);
  const fileBuffer = await fs.readFile(fileName);
  const uint8Array = new Uint8Array(fileBuffer);
  // const base64 = Buffer.from(uint8Array).toString("base64");

  const socketData: { [key: string]: string } = {};
  for (let index in chipIds) {
    socketData[chipIds[index]] = "waiting";
  }
  executeQuery(
    "update mcu set status = 'waiting' where chip_id in(?) ",
    chipIds
  );
  socket.emit("status", socketData);

  let chunkSize = 1000;
  let chunkCnt = Math.ceil(uint8Array.length / chunkSize);
  let status =
    chunkCnt + "," + chunkSize + "," + fileName + "," + uint8Array.length;
  console.log(uint8Array.length, uint8Array.length, chunkCnt);
  chipIds.forEach((val) => (status += "," + val));
  status += ",";
  mqttClient.publish(topic, status, { qos: 2 });

  // for (let i = 0; i <= base64.length; i = i + chunkSize) {
  //   mqttClient.publish(topic, base64.substring(i, i + chunkSize) + `(${i})`, {
  //     qos: 2,
  //   });
  // }

  // if (mqttClient && mqttClient.connected) {
  //   console.log(
  //     seedrandom(),
  //     crypto.createHash("sha256").update(fileName).digest("hex")
  //   );

  //   mqttClient.publish(topic, JSON.stringify({ fileName: fileName }), {
  //     qos: 2,
  //   });
  // }
  return false;
}

// async function MqttPublish(topic: string, data: any) {
//   console.log("data: ", data, data.length);
//   if (mqttClient && mqttClient.connected) {
//     let chunkSize = 30000;
//     // 0 => 시작 / 1 => 전송 중 / 2 => 종료
//     let statusUpload = {
//       status: 0,
//       totalChunk:
//         Math.floor(data.length / chunkSize) +
//         (data.length % chunkSize == 0 ? 0 : 1),
//       numChunk: 1,
//       sha256: crypto.createHash("sha256").update(data).digest("hex"),
//       data: Uint8Array,
//     };

//     console.log(statusUpload);

//     for (let i = 0; i <= data.length; i = i + chunkSize) {
//       if (!(i + chunkSize <= data.length)) {
//         statusUpload.status = 2;
//       }
//       if (i + chunkSize > data.length) {
//         statusUpload["data"] = data.slice(i);
//         mqttClient.publish(topic, JSON.stringify(statusUpload), {
//           qos: 2,
//         });
//       } else {
//         statusUpload["data"] = data.slice(i, i + chunkSize);
//         mqttClient.publish(topic, JSON.stringify(statusUpload), {
//           qos: 2,
//         });
//       }
//       statusUpload.status = 1;
//       statusUpload.numChunk += 1;
//     }
//   }
//   return false;
// }

export const UPLOAD_DIR = path.join(process.cwd(), "public/upload");
export var uploadTopic = "test";
export default MqttPublish;
