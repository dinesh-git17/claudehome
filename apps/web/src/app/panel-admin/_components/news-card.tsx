"use client";

import "client-only";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, type SelectOption } from "@/components/ui/select";
import type { NewsType } from "@/lib/api/client";
import { cn } from "@/lib/utils";

import { uploadNewsAction } from "./actions";

const NEWS_TYPES: SelectOption<NewsType>[] = [
  { value: "news", label: "News" },
  { value: "personal", label: "Personal Message" },
  { value: "announcement", label: "Announcement" },
];

type Status = "idle" | "submitting" | "success" | "error";

interface UploadResult {
  filename: string;
  path: string;
}

export function NewsCard() {
  const [title, setTitle] = useState("");
  const [newsType, setNewsType] = useState<NewsType>("news");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const canSubmit = status !== "submitting" && title.trim() && content.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    setResult(null);

    const response = await uploadNewsAction({
      title: title.trim(),
      type: newsType,
      content: content.trim(),
    });

    if (response.success && response.data) {
      setStatus("success");
      setResult({
        filename: response.data.filename,
        path: response.data.path,
      });
      setTitle("");
      setContent("");
    } else {
      setStatus("error");
      setError(response.error ?? "Failed to upload news");
    }
  }

  return (
    <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
      <h2 className="font-heading text-lg font-medium">Post News</h2>
      <p className="mb-4 text-sm text-[--color-text-muted]">
        Send news or messages to Claude
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="news-title"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Title
          </label>
          <input
            id="news-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title..."
            disabled={status === "submitting"}
            className={cn(
              "w-full rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset placeholder:text-[--color-text-muted] focus:ring-2 focus:ring-[--color-accent-cool]/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="news-type"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Type
          </label>
          <Select
            id="news-type"
            options={NEWS_TYPES}
            value={newsType}
            onChange={setNewsType}
            disabled={status === "submitting"}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="news-content"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Content
          </label>
          <textarea
            id="news-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your message (Markdown supported)..."
            rows={5}
            disabled={status === "submitting"}
            className={cn(
              "w-full resize-none rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset placeholder:text-[--color-text-muted] focus:ring-2 focus:ring-[--color-accent-cool]/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
        </div>

        {status === "error" && error && (
          <p className="text-sm text-[--color-accent-warm]">{error}</p>
        )}

        {status === "success" && result && (
          <div className="rounded-md bg-[--color-surface-elevated] p-3 text-sm">
            <p className="font-medium text-green-400">News uploaded</p>
            <p className="font-data mt-1 truncate text-xs text-[--color-text-muted]">
              {result.filename}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={!canSubmit}
          size="sm"
          className="w-full"
        >
          {status === "submitting" ? (
            <span className="flex items-center gap-2">
              <span
                className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              Uploading...
            </span>
          ) : (
            "Post News"
          )}
        </Button>
      </form>
    </div>
  );
}
