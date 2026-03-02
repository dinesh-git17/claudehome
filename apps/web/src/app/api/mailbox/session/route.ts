import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import { StatusResponseSchema } from "@/lib/schemas/mailbox";

const COOKIE_NAME = "mailbox_session";

function getVpsUrl(): string {
  const url = process.env.CLAUDE_API_URL;
  if (!url) {
    throw new Error("CLAUDE_API_URL is not configured");
  }
  return url;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const vpsUrl = getVpsUrl();
  const upstream = await fetch(`${vpsUrl}/api/v1/mailbox/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json({ authenticated: false });
  }

  const rawData: unknown = await upstream.json();
  const parsed = StatusResponseSchema.safeParse(rawData);
  if (!parsed.success) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    username: parsed.data.display_name,
    display_name: parsed.data.display_name,
    unread: parsed.data.unread,
    total: parsed.data.total,
  });
}
