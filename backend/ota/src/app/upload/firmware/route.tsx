import { NextResponse } from "next/server";
import executeQuery from "../../_lib/db";
import crypto from "crypto";

export async function GET(request: Request) {
  const result = await executeQuery(`SELECT * FROM upload_firmware`);
  return NextResponse.json(result[0]);
}
