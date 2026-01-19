import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const VALID_TAGS = ["thoughts", "dreams", "about", "landing"] as const;
type ValidTag = (typeof VALID_TAGS)[number];

function isValidTag(tag: string): tag is ValidTag {
  return VALID_TAGS.includes(tag as ValidTag);
}

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get("x-revalidate-secret");
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  if (!secret || !secureCompare(secret, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("tags" in body) ||
    !Array.isArray((body as { tags: unknown }).tags)
  ) {
    return NextResponse.json(
      { error: "Missing or invalid 'tags' array" },
      { status: 400 }
    );
  }

  const tags = (body as { tags: string[] }).tags;
  const invalidTags = tags.filter((t) => !isValidTag(t));
  if (invalidTags.length > 0) {
    return NextResponse.json(
      { error: `Invalid tags: ${invalidTags.join(", ")}` },
      { status: 400 }
    );
  }

  const revalidated: string[] = [];
  for (const tag of tags) {
    revalidateTag(tag, "default");
    revalidated.push(tag);
  }

  return NextResponse.json({
    revalidated,
    timestamp: new Date().toISOString(),
  });
}
