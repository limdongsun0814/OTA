import { NextResponse } from "next/server";
import executeQuery from "../_lib/db";
import crypto from "crypto";

export async function POST(request: Request) {
  const data = await request.json();
  console.log("aaaaaa", data);
  const pw = crypto
    .createHash("sha256")
    .update(data.id)
    .update(data.pw)
    .digest("hex");
  console.log(pw);
  const result = await executeQuery(
    "select count(*) as cnt from emp where emp_no = ? and password = ? ",
    [data.id, pw]
  );
  console.log(result, result[0][0].cnt);
  if (result[0][0].cnt == 1) {
    return NextResponse.json({ search: true });
  }
  return NextResponse.json({ search: false });
}
