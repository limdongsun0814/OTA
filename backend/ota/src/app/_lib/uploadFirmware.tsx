import MqttPublish, { uploadTopic, UPLOAD_DIR } from "../_lib/uploadMqtt";
import fs from "fs/promises";

export default async function uploadFirmware(fileName: string, addresses: []) {
  const fileBuffer = await fs.readFile(fileName);
  const uint8Array = new Uint8Array(fileBuffer);
  const fileBlob = new Blob([uint8Array]);
  const formData = new FormData();
  formData.append("upload", fileBlob);
  for (const address of addresses) {
    console.log(address, "http://" + address + "/update");
    fetch("http://" + address + "/update", {
      method: "POST",
      body: formData,
    });
  }
}
