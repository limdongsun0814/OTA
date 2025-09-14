import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import executeQuery from "../_lib/db";
import MqttPublish, { uploadTopic, UPLOAD_DIR } from "../_lib/uploadMqtt";
import uploadFirmware from "../_lib/uploadFirmware";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get("upload") as File;
    const now = data.get("now");
    let messge = "에러가 발생했습니다.";
    let status = 500;
    if (file) {
      let extension = file.name.split(".").slice(-2);
      let id = uuidv4();
      console.log("Request:", file.name, file.type, file.size, extension);
      if ((extension[0] == "ino", extension[1] == "bin")) {
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
        const filePath = path.join(UPLOAD_DIR, id + file.name);
        console.log(filePath);
        executeQuery("insert into upload_firmware ( file_name )value( ? )", [
          id + file.name,
        ]);
        console.log(buffer[buffer.length - 1], "result2");
        await fs.writeFile(filePath, buffer);
        if (now) {
          const addresses = await executeQuery("select ip from mcu");
          let addressList = [];
          for (const index in addresses[0]) {
            addressList.push(addresses[0][index].ip);
          }
          console.log(addressList);
          uploadFirmware(filePath, addressList);
        }
        // MqttPublish(uploadTopic, id + file.name);
        messge = "파일 및 데이터가 성공적으로 업로드되었습니다.";
        status = 200;
      } else {
        messge = "파일 형식이 맞지 않습니다.";
        status = 500;
      }
    }
    return NextResponse.json(
      {
        message: messge,
      },
      { status: status }
    );
  } catch (error) {
    console.log("Error: ", error);
    return NextResponse.json(
      {
        message: "에러가 발생했습니다.",
        error: error,
      },
      { status: 500 }
    );
  }
}
