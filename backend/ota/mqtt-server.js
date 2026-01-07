require("dotenv").config();

const mysql = require("mysql2/promise");
const { io } = require("socket.io-client");
const mqtt = require("mqtt");
const fs = require("fs/promises");
const crypto = require("crypto");
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || "");

const socketHostname = process.env.SOCKET_HOSTNAME;
const socketPort = process.env.SOCKET_PORT;
const socket = io(`http://${socketHostname}:${socketPort}`);
const aesKeyStr = process.env.SECRET_AES_KEY;
const aesKeyHex = Buffer.from(aesKeyStr, "hex");

mqttClient.on("connect", () => {
  mqttClient
    .subscribe("backend", (err) => {
      if (!err) {
        console.log("구독 성공");
      } else {
        console.log("구독 실패", err);
      }
    })
    .subscribe("status", (err) => {
      if (!err) {
        console.log("구독 성공");
      } else {
        console.log("구독 실패", err);
      }
    });

  mqttClient.on("message", async (topic, data) => {
    switch (topic) {
      case "backend": {
        const chunkObj = JSON.parse(data);
        const secret = SecretMap.getInstance(chunkObj.chipId);
        secret.chunkIndex = chunkObj.chunkIndex;
        mqttPub(secret);
        return;
      }
      case "status": {
        const dataJson = JSON.parse(data);
        for (let chipId of dataJson.chipIds) {
          console.log(chipId);
          const secret = SecretMap.getInstance(chipId, dataJson);
          mqttPubInit(chipId, secret);
        }
        return;
      }
    }
  });
});

class SecretMap {
  static secretMap = new Map();
  static getInstance(chipId, data) {
    //iv, key, chunkCnt, chunkSize

    const iv = crypto.randomBytes(16);
    if (!this.secretMap.has(chipId)) {
      this.secretMap.set(
        chipId,
        new Secret(
          iv,
          aesKeyHex,
          data.chunkCnt,
          data.chunkSize,
          data.fileName,
          data.fileSize,
          chipId
        )
      );
    }
    return this.secretMap.get(chipId);
  }
}

class Secret {
  constructor(iv, key, chunkCnt, chunkSize, fileName, fileSize, chipId) {
    this.iv = iv;
    this.key = key;
    this.chunkMax = chunkCnt;
    this.chunkSize = chunkSize;
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.chipId = chipId;
    this.chunkIndex = 0;
  }
}

class Files {
  static files = new Map();
  static async getInstance(fileName) {
    if (!Files.files.has(fileName)) {
      const fileBuffer = await fs.readFile(fileName);
      const uint8Array = new Uint8Array(fileBuffer);
      const digest = crypto
        .createHash("sha256")
        .update(uint8Array)
        .digest("hex");
      Files.files.set(fileName, new File(fileName, uint8Array, digest));
    }
    return Files.files.get(fileName);
  }
}

class File {
  constructor(fileName, uint8Array, digest) {
    this.fileUint8Array = uint8Array;
    this.usingInstance = 0;
    this.digest = digest;
    this.fileName = fileName;
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

function fileCrypto(fileBuffer, secret, key) {
  secret.iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-128-cbc", key, secret.iv);
  let encrypted = cipher.update(fileBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  console.log(key, "key");
  console.log(secret.iv, "iv");
  return new Uint8Array(encrypted);
}
function base64ToHex(input) {
  return Buffer.from(input, "base64");
}
// dataJson = {fileName,chunkSize,chunkMax,iv,chipId}
async function mqttPub(secret) {
  const filesInstance = await Files.getInstance(secret.fileName);
  console.log(secret, "data");
  const fileUint8Array = filesInstance.getFileUint8Array(
    secret.chunkIndex,
    secret.chunkSize,
    secret.chunkMax
  );
  console.log(fileUint8Array.length);
  console.log(fileUint8Array, "file Data");

  const encrypted = fileCrypto(fileUint8Array, secret, aesKeyHex);
  const transfer = Buffer.concat([secret.iv, encrypted]);
  console.log(transfer, transfer.length, "file encrypted");
  mqttClient.publish(secret.chipId, transfer, (err) => {
    if (secret.chunkIndex == secret.chunkMax - 1) {
      executeQuery(
        "update mcu set status = 'restart' where chip_id in(?) ",
        secret.chipId
      );
      socket.emit("status", { [secret.chipId]: "restart" });
    }
    Files.getInstance(secret.fileName).then((file) => {
      if (file.usingInstance == 0) {
        Files.files.delete(secret.fileName);
      }
    });
  });
}

async function mqttPubInit(chipId, secret) {
  const filesInstance = await Files.getInstance(secret.fileName);
  // sha256 + chunkSize
  const buf = Buffer.alloc(4);
  console.log(secret.fileSize);
  buf.writeUInt32BE(secret.fileSize);
  const transfer = Buffer.concat([
    Buffer.from(filesInstance.digest, "hex"),
    buf,
  ]);
  console.log("transfer: ", transfer);
  mqttClient.publish(chipId + "status", transfer);
}
