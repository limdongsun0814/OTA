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
  const address = await executeQuery("select ip from mcu where chip_id = ?", [
    chipId,
  ]);
  uploadFirmware(UPLOAD_DIR + "/" + fileName, [address[0][0].ip]);
  return NextResponse.json({ send: "ok" });
}
