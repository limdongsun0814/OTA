import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import executeQuery from "../_lib/db";
import MqttPublish, { uploadTopic, UPLOAD_DIR } from "../_lib/uploadMqtt";
import uploadFirmware from "../_lib/uploadFirmware";
import { v4 as uuidv4 } from "uuid";
import { io } from "socket.io-client";

export async function PUT(request: Request) {
  const data = await request.json();
  var resData = { 0: [], 1: [] };
  const uploadFirmwareData: { [key: string]: [] } = {};
  for (let val in data) {
    const result = await executeQuery(
      `update firmware set upload_firmware = ? 
      where chip_id = ?`,
      [data[val]["upload firmware"], data[val]["chip id"]]
    );
    resData[result[0].affectedRows].push(data[val]["chip id"]);
    if (uploadFirmwareData[data[val]["upload firmware"]] == null) {
      uploadFirmwareData[data[val]["upload firmware"]] = [];
    }
    uploadFirmwareData[data[val]["upload firmware"]].push(data[val]["chip id"]);
  }
  for (let fileName in uploadFirmwareData) {
    // uploadFirmware(UPLOAD_DIR + "/" + fileName, uploadFirmwareData[fileName]);
    MqttPublish(
      "status",
      UPLOAD_DIR + "/" + fileName,
      uploadFirmwareData[fileName]
    );
  }
  // uploadFirmware(UPLOAD_DIR + "/" + fileName, [chip[0][0].chip_id]);
  return NextResponse.json(resData);
}

export async function GET(request: Request) {
  const result = await executeQuery(
    `SELECT
        firmware.chip_id AS 'chip id',
        firmware.upload_firmware AS 'upload firmware',
        DATE_FORMAT(firmware.last_upload_time, '%Y-%m-%d %H:%i:%s') AS 'last upload time',
        mcu.ip AS ip,
        mcu.status AS status
    FROM
        firmware
    JOIN
        mcu
    ON
        firmware.chip_id = mcu.chip_id`
  );
  return NextResponse.json(result[0]);
}

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
        await executeQuery(
          "insert into upload_firmware ( file_name )value( ? )",
          [id + file.name]
        );
        console.log(buffer[buffer.length - 1], "result2");
        await fs.writeFile(filePath, buffer);
        if (now) {
          const chipId = await executeQuery("select chip_id from mcu");
          let chipIdList = [];
          for (const index in chipId[0]) {
            chipIdList.push(chipId[0][index].chip_id);
          }
          console.log(chipIdList);
          uploadFirmware(filePath, chipId);
        }
        // MqttPublish(uploadTopic, id + file.name);

        const firmwareList = await executeQuery(
          "select * from upload_firmware"
        );

        const socketHostname = process.env.SOCKET_HOSTNAME;
        const socketPort = process.env.SOCKET_PORT;
        const socket = io(`http://${socketHostname}:${socketPort}`);
        socket.on("connect", () => {
          socket.emit("firmware", firmwareList[0]);
        });

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
