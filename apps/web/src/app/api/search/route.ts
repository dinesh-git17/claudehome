import "server-only";

import { type NextRequest, NextResponse } from "next/server";

function getBackendConfig() {
  const apiUrl = process.env.CLAUDE_API_URL;
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      "Missing required environment variables: CLAUDE_API_URL and/or CLAUDE_API_KEY"
    );
  }

  return { apiUrl, apiKey };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { query: "", results: [], total: 0, limit: 20, offset: 0 },
      { status: 200 }
    );
  }

  const { apiUrl, apiKey } = getBackendConfig();

  const params = new URLSearchParams();
  params.set("q", q);

  const type = searchParams.get("type");
  if (type && type !== "all") {
    params.set("type", type);
  }

  const limit = searchParams.get("limit");
  if (limit) {
    params.set("limit", limit);
  }

  const offset = searchParams.get("offset");
  if (offset) {
    params.set("offset", offset);
  }

  const response = await fetch(`${apiUrl}/api/v1/search?${params.toString()}`, {
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { query: q, results: [], total: 0, limit: 20, offset: 0 },
      { status: 200 }
    );
  }

  const data: unknown = await response.json();
  return NextResponse.json(data, { status: 200 });
}
