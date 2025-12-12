require("dotenv").config();

const mysql = require("mysql2/promise");
const { io } = require("socket.io-client");
const mqtt = require("mqtt");
const fs = require("fs/promises");
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || "");

const socketHostname = process.env.SOCKET_HOSTNAME;
const socketPort = process.env.SOCKET_PORT;
const socket = io(`http://${socketHostname}:${socketPort}`);

mqttClient.on("connect", () => {
  mqttClient.subscribe("backend", (err) => {
    if (!err) {
      console.log("구독 성공");
    } else {
      console.log("구독 실패", err);
    }
    // "{" + chipId_str + ":0,\"fileName\":\""+this->fileName.c_str()+"\"}"
  });

  mqttClient.on("message", async (topic, data) => {
    switch (topic) {
      case "backend":
        const dataJson = JSON.parse(data);
        // console.log(topic, dataJson);
        if (dataJson.chunkIndex == 0) {
          executeQuery(
            "update mcu set status = 'uploading' where chip_id in(?) ",
            dataJson.chipId
          );
          socket.emit("status", { [dataJson.chipId]: "uploading" });
        }

        const filesInstance = await Files.getInstance(dataJson.fileName);
        const fileUint8Array = filesInstance.getFileUint8Array(
          dataJson.chunkIndex,
          dataJson.chunkSize,
          dataJson.chunkMax
        );
        console.log(fileUint8Array.length);
        mqttClient.publish(dataJson.chipId, fileUint8Array, (err) => {
          if (dataJson.chunkIndex == dataJson.chunkMax - 1) {
            executeQuery(
              "update mcu set status = 'restart' where chip_id in(?) ",
              dataJson.chipId
            );
            socket.emit("status", { [dataJson.chipId]: "restart" });
          }
          Files.getInstance(dataJson.fileName).then((file) => {
            if (file.usingInstance == 0) {
              Files.files.delete(dataJson.fileName);
            }
          });
        });
        return;
    }
  });
});

class Files {
  static files = new Map();
  static async getInstance(fileName) {
    if (!Files.files.has(fileName)) {
      const fileBuffer = await fs.readFile(fileName);
      Files.files.set(fileName, new File(fileName, fileBuffer));
    }
    return Files.files.get(fileName);
  }
}

class File {
  constructor(fileName, fileBuffer) {
    this.fileUint8Array = new Uint8Array(fileBuffer);
    this.usingInstance = 0;
  }

  getFileUint8Array(chunkIndex, chunkSize, chunkMax) {
    if (chunkIndex == 0) {
      this.usingInstance += 1;
    } else if (chunkIndex == chunkMax - 1) {
      this.usingInstance -= 1;
    }
    console.log(
      chunkIndex * chunkSize,
      chunkIndex * chunkSize + chunkSize,
      chunkIndex == chunkMax - 1,
      this.usingInstance,
      "aaaa"
    );
    return this.fileUint8Array.subarray(
      chunkIndex * chunkSize,
      chunkIndex * chunkSize + chunkSize
    );
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
});

async function executeQuery(query, values) {
  if (!pool) {
    throw new Error("DB가 연결되지 않았습니다.");
  }
  return pool.query(query, values);
}
