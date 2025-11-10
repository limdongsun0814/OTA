require("dotenv").config();
const mqtt = require("mqtt");
const fs = require("fs/promises");
const mqttClient = mqtt.connect(process.env.MQTT_BROKER || "");

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
        console.log(topic, dataJson);
        const filesInstance = await Files.getInstance(dataJson.fileName);
        const fileUint8Array = filesInstance.getFileUint8Array(
          dataJson.chunkIndex,
          dataJson.chunkSize,
          dataJson.chunkMax
        );
        console.log(fileUint8Array.length);
        mqttClient.publish(dataJson.chipId, fileUint8Array, (err) => {
          if (Files.getInstance(dataJson.fileName).usingInstance == 0) {
            Files.files.delete(dataJson.fileName);
          }
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
    } else if (chunkIndex == chunkMax) {
      this.usingInstance -= 1;
    }
    console.log(
      chunkIndex * chunkSize,
      chunkIndex * chunkSize + chunkSize,
      "aaaa"
    );
    return this.fileUint8Array.subarray(
      chunkIndex * chunkSize,
      chunkIndex * chunkSize + chunkSize
    );
  }
}
