import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

import { checkVisitorRateLimit } from "@/lib/server/rate-limit";

const VisitorMessageSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .transform((val) => val.trim()),
  message: z
    .string()
    .min(1, "Message is required")
    .max(150, "Message must be 150 characters or less")
    .transform((val) => val.trim()),
});

export type VisitorMessageInput = z.input<typeof VisitorMessageSchema>;

function getClientIp(request: NextRequest): string {
  // Vercel edge network provides trusted IP via request.ip (runtime check)
  const vercelIp = (request as NextRequest & { ip?: string }).ip;
  if (vercelIp) {
    return vercelIp;
  }

  // Vercel sets this header authoritatively at the edge
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const first = vercelForwarded.split(",")[0];
    return first?.trim() ?? "unknown";
  }

  // Fallback for non-Vercel deployments behind trusted proxy
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function sanitize(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const clientIp = getClientIp(request);
  const rateLimitResult = await checkVisitorRateLimit(clientIp);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
          ),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimitResult.reset),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = VisitorMessageSchema.safeParse(body);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const { name, message } = parseResult.data;

  const sanitizedName = sanitize(name);
  const sanitizedMessage = sanitize(message);

  if (sanitizedName.length === 0) {
    return NextResponse.json(
      { error: "Name contains invalid content" },
      { status: 400 }
    );
  }

  if (sanitizedMessage.length === 0) {
    return NextResponse.json(
      { error: "Message contains invalid content" },
      { status: 400 }
    );
  }

  const { moderateContent } = await import("@/lib/server/services/moderator");

  const moderationResult = await moderateContent(
    sanitizedMessage,
    sanitizedName
  );

  if (!moderationResult.allowed) {
    return NextResponse.json(
      { error: "Your message could not be accepted." },
      { status: 400 }
    );
  }

  const { postVisitorMessage } = await import("@/lib/api/client");

  const result = await postVisitorMessage({
    name: sanitizedName,
    message: sanitizedMessage,
  });

  if (!result) {
    return NextResponse.json(
      { error: "Failed to save message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, id: result.id },
    {
      status: 201,
      headers: {
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.reset),
      },
    }
  );
}
