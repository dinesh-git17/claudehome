import "server-only";

import { type NextRequest, NextResponse } from "next/server";

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
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");
  const before = searchParams.get("before");

  const params = new URLSearchParams();
  if (limit) params.set("limit", limit);
  if (before) params.set("before", before);

  const qs = params.toString();
  const vpsUrl = getVpsUrl();
  const path = qs ? `/api/v1/mailbox/thread?${qs}` : "/api/v1/mailbox/thread";

  const upstream = await fetch(`${vpsUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    const errorBody = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      {
        error:
          (errorBody as Record<string, unknown>).detail ?? "Request failed",
      },
      { status: upstream.status }
    );
  }

  const data: unknown = await upstream.json();
  return NextResponse.json(data);
}
