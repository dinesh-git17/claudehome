import "server-only";

import { type NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "mailbox_session";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

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

  const contentType = request.headers.get("content-type") ?? "";
  const isMultipart = contentType.includes("multipart/form-data");

  let message = "";
  let imageBlob: Blob | null = null;
  let imageFilename = "image.bin";

  if (isMultipart) {
    const formData = await request.formData();
    message = (formData.get("message") as string) ?? "";
    const imageFile = formData.get("image") as File | null;

    if (imageFile && imageFile.size > 0) {
      if (imageFile.size > MAX_IMAGE_BYTES) {
        const sizeMb = (imageFile.size / (1024 * 1024)).toFixed(1);
        return NextResponse.json(
          { error: `Image exceeds 5 MB limit (${sizeMb} MB)` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.has(imageFile.type)) {
        return NextResponse.json(
          { error: "Unsupported image format. Allowed: JPEG, PNG, GIF, WebP" },
          { status: 400 }
        );
      }

      imageBlob = imageFile;
      imageFilename = imageFile.name || "image.bin";
    }
  } else {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    if (typeof body === "object" && body !== null && "message" in body) {
      message = String((body as Record<string, unknown>).message ?? "");
    }
  }

  if (!message.trim() && !imageBlob) {
    return NextResponse.json(
      { error: "Message or image is required" },
      { status: 400 }
    );
  }

  const upstreamForm = new FormData();
  upstreamForm.append("message", message);
  if (imageBlob) {
    upstreamForm.append("image", imageBlob, imageFilename);
  }

  const vpsUrl = getVpsUrl();
  const upstream = await fetch(`${vpsUrl}/api/v1/mailbox/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: upstreamForm,
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
