import { NextRequest, NextResponse } from "next/server";
import {
  checkCsrfToken,
  createCsrfToken,
  destroyCsrfToken,
  sessionOptions,
} from "../_lib/csrf";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { getIronSession, IronSessionData } from "iron-session";

export async function GET(req: Request) {
  const csrfToken = await createCsrfToken(req);
  return NextResponse.json({ csrfToken: csrfToken });
}

export async function POST(req: Request) {
  const checkCsrf = await checkCsrfToken(req);
  return NextResponse.json({ checkCsrf: checkCsrf });
}
export async function DELETE(req: Request) {
  await destroyCsrfToken();
  return NextResponse.json({ checkCsrf: true });
}

// export default withSessionRoute<
//   T extends (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
// >(handle: T)=> {
// if (req.method == "GET") {
//   if (!req.session.csrfToken) {
//     req.session.csrfToken = crypto.randomBytes(16).toString("hex");
//     await req.session.save();
//   }
// }
//   return NextResponse.json({ send: "ok" });
// }
