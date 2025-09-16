import MqttPublish, { uploadTopic, UPLOAD_DIR } from "../_lib/uploadMqtt";
import executeQuery from "./db";
("../_lib/db");
import fs from "fs/promises";

export default async function uploadFirmware(
  fileName: string,
  addresses: string[]
) {
  const fileBuffer = await fs.readFile(fileName);
  const uint8Array = new Uint8Array(fileBuffer);
  const fileBlob = new Blob([uint8Array]);
  const formData = new FormData();
  formData.append("upload", fileBlob);
  executeQuery("update mcu set status = 'waiting' where ip in(?) ", addresses);
  for (const address of addresses) {
    console.log(address, "http://" + address + "/update", fileBlob);
    executeQuery("update mcu set status = 'uploading' where ip = ?", address);
    fetch("http://" + address + "/update", {
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
        executeQuery("update mcu set status = 'restart' where ip = ?", address);
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
