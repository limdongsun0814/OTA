import { NextResponse } from "next/server";
import executeQuery from "../_lib/db";

export async function POST(request: Request) {
  const data = await request.json();
  const { chipId, ip } = data;
  console.log(chipId, ip);
  executeQuery(
    "insert into mcu ( chip_id, ip )value( ?,? ) on duplicate key update ip = ip",
    [chipId, ip]
  );

  return NextResponse.json({ send: "ok" });
}
