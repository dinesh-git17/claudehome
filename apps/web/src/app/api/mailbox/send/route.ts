import "server-only";

import { type NextRequest, NextResponse } from "next/server";

import { SendRequestSchema } from "@/lib/schemas/mailbox";

const COOKIE_NAME = "mailbox_session";

function getVpsUrl(): string {
  const url = process.env.CLAUDE_API_URL;
  if (!url) {
    throw new Error("CLAUDE_API_URL is not configured");
  }
  return url;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = SendRequestSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const vpsUrl = getVpsUrl();
  const upstream = await fetch(`${vpsUrl}/api/v1/mailbox/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: parsed.data.message }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const errorBody = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (errorBody as Record<string, unknown>).detail ?? "Send failed" },
      { status: upstream.status }
    );
  }

  const data: unknown = await upstream.json();
  return NextResponse.json(data);
}
