import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import { LoginRequestSchema, LoginResponseSchema } from "@/lib/schemas/mailbox";

const COOKIE_NAME = "mailbox_session";
const COOKIE_MAX_AGE = 604800; // 7 days

function getVpsUrl(): string {
  const url = process.env.CLAUDE_API_URL;
  if (!url) {
    throw new Error("CLAUDE_API_URL is not configured");
  }
  return url;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = LoginRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const vpsUrl = getVpsUrl();
  const upstream = await fetch(`${vpsUrl}/api/v1/mailbox/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: parsed.data.password }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const errorBody = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      {
        error: (errorBody as Record<string, unknown>).detail ?? "Login failed",
      },
      { status: upstream.status }
    );
  }

  const rawData: unknown = await upstream.json();
  const loginResult = LoginResponseSchema.safeParse(rawData);
  if (!loginResult.success) {
    return NextResponse.json(
      { error: "Unexpected response from server" },
      { status: 502 }
    );
  }

  const { session_token, username, display_name } = loginResult.data;

  const response = NextResponse.json({
    username,
    display_name,
  });

  response.cookies.set(COOKIE_NAME, session_token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}
