import { getIronSession, IronSessionData, SessionOptions } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

declare module "iron-session" {
  interface IronSessionData {
    csrfToken?: string;
  }
}

declare module "next" {
  interface NextApiRequest {
    session: import("iron-session").IronSession<
      import("iron-session").IronSessionData
    >;
  }
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "session",
  cookieOptions: {
    httpOnly: true,
    maxAge: 30 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  },
};

export async function createCsrfToken(req: Request) {
  const session = await getIronSession<IronSessionData>(
    await cookies(),
    sessionOptions
  );

  if (!session.csrfToken) {
    session.csrfToken = crypto.randomBytes(16).toString("hex");
    await session.save();
  }
  return session.csrfToken;
}

export async function checkCsrfToken(req: Request) {
  const clientCsrfToken = req.headers.get("x-csrf-token");
  const serverCsrfToken = (
    await getIronSession<IronSessionData>(await cookies(), sessionOptions)
  ).csrfToken;
  console.log(clientCsrfToken, serverCsrfToken);
  if (
    clientCsrfToken &&
    serverCsrfToken &&
    clientCsrfToken == serverCsrfToken
  ) {
    return true;
  }
  return false;
}

export async function destroyCsrfToken() {
  (
    await getIronSession<IronSessionData>(await cookies(), sessionOptions)
  ).destroy();
}

// export function withCsrfProtextion<
//   T extends (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void
// >(handle: T) {
//   return withSessionRoute(async (req: NextApiRequest, res: NextApiResponse) => {
//     if (!["GET", "HEAD", "OPTIONS"].includes(req.method as string)) {
//       const clientCsrfToken = Array.isArray(req.headers["x-csrf-token"])
//         ? req.headers["x-csrf-token"][0]
//         : req.headers["x-csrf-token"];
//       const serverCsrfToken = req.session.csrfToken;
//       if (
//         clientCsrfToken ||
//         serverCsrfToken ||
//         clientCsrfToken == serverCsrfToken
//       ) {
//         return handle(req, res);
//       }
//       return res.status(403).json({ massage: "invaild CSRF token" });
//     }
//   });
// }
