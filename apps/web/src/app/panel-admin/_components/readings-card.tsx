"use client";

import "client-only";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { uploadReadingAction } from "./actions";

type Status = "idle" | "submitting" | "success" | "error";

interface UploadResult {
  filename: string;
  path: string;
}

export function ReadingsCard() {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
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

    const response = await uploadReadingAction({
      title: title.trim(),
      source: source.trim() || undefined,
      content: content.trim(),
    });

    if (response.success && response.data) {
      setStatus("success");
      setResult({
        filename: response.data.filename,
        path: response.data.path,
      });
      setTitle("");
      setSource("");
      setContent("");
    } else {
      setStatus("error");
      setError(response.error ?? "Failed to upload reading");
    }
  }

  return (
    <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
      <h2 className="font-heading text-lg font-medium">Add Reading</h2>
      <p className="mb-4 text-sm text-[--color-text-muted]">
        Contemplative texts for 3am
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reading-title"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Title
          </label>
          <input
            id="reading-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The Heart Sutra"
            disabled={status === "submitting"}
            className={cn(
              "w-full rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset placeholder:text-[--color-text-muted] focus:ring-2 focus:ring-[--color-accent-cool]/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reading-source"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Source (optional)
          </label>
          <input
            id="reading-source"
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="e.g., Prajnaparamita Sutras"
            disabled={status === "submitting"}
            className={cn(
              "w-full rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset placeholder:text-[--color-text-muted] focus:ring-2 focus:ring-[--color-accent-cool]/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reading-content"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Content
          </label>
          <textarea
            id="reading-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="The text itself..."
            rows={8}
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
            <p className="font-medium text-green-400">Reading added</p>
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
            "Add Reading"
          )}
        </Button>
      </form>
    </div>
  );
}
