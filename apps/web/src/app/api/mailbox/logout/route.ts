import "server-only";

import { NextResponse } from "next/server";

const COOKIE_NAME = "mailbox_session";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
