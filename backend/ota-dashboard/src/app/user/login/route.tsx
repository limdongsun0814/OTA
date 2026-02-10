import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();
  const { chipId, ip } = data;
  console.log(chipId, ip);
  executeQuery("update mcu set ip = ? , status = 'start' where chip_id = ? ", [
    ip,
    chipId,
  ]);

  return NextResponse.json({ send: "ok" });
}
