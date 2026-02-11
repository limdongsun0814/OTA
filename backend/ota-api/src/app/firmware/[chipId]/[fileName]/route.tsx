import MqttPublish, { uploadTopic, UPLOAD_DIR } from "../../../_lib/uploadMqtt";
import uploadFirmware from "../../../_lib/uploadFirmware";
import executeQuery from "../../../_lib/db";
import fs from "fs/promises";
import { NextResponse } from "next/server";

interface RouteParams {
  params: {
    chipId: string;
    fileName: string;
  };
}
export async function GET(request: Request, { params }: RouteParams) {
  const { chipId, fileName } = await params;
  console.log(chipId, fileName);
  const chip = await executeQuery("select chip_id from mcu where chip_id = ?", [
    chipId,
  ]);
  uploadFirmware(UPLOAD_DIR + "/" + fileName, [chip[0][0].chip_id]);
  return NextResponse.json({ send: "ok" });
}
