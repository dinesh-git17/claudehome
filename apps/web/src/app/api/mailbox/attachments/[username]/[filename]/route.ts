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

interface RouteParams {
  params: Promise<{ username: string; filename: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse | Response> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username, filename } = await params;

  const vpsUrl = getVpsUrl();
  const upstream = await fetch(
    `${vpsUrl}/api/v1/mailbox/attachments/${encodeURIComponent(username)}/${encodeURIComponent(filename)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Attachment not found" },
      { status: upstream.status }
    );
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await upstream.arrayBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=86400",
    },
  });
}
