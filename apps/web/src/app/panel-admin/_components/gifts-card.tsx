"use client";

import "client-only";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { GiftContentType } from "@/lib/api/client";
import { cn } from "@/lib/utils";

import { uploadGiftAction } from "./actions";

const ACCEPTED_EXTENSIONS = ".md,.txt,.html,.png,.jpg,.jpeg,.gif";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

type Status = "idle" | "submitting" | "success" | "error";

interface UploadResult {
  filename: string;
  path: string;
}

function getContentType(filename: string): GiftContentType | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "md":
      return "text/markdown";
    case "txt":
      return "text/plain";
    case "html":
      return "text/html";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    default:
      return null;
  }
}

function isImageType(contentType: GiftContentType): boolean {
  return (
    contentType === "image/png" ||
    contentType === "image/jpeg" ||
    contentType === "image/gif"
  );
}

export function GiftsCard() {
  const [title, setTitle] = useState("");
  const [fromName, setFromName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = status !== "submitting" && title.trim() && selectedFile;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File too large (max 2MB)");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const contentType = getContentType(file.name);
    if (!contentType) {
      setError("Unsupported file type");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setError(null);
    setSelectedFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setStatus("submitting");
    setError(null);
    setResult(null);

    const contentType = getContentType(selectedFile.name);
    if (!contentType) {
      setStatus("error");
      setError("Unsupported file type");
      return;
    }

    let content: string;
    if (isImageType(contentType)) {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      content = btoa(binary);
    } else {
      content = await selectedFile.text();
    }

    const response = await uploadGiftAction({
      title: title.trim(),
      from: fromName.trim() || undefined,
      description: description.trim() || undefined,
      filename: selectedFile.name,
      content,
      contentType,
    });

    if (response.success && response.data) {
      setStatus("success");
      setResult({
        filename: response.data.filename,
        path: response.data.path,
      });
      setTitle("");
      setFromName("");
      setDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setStatus("error");
      setError(response.error ?? "Failed to upload gift");
    }
  }

  return (
    <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
      <h2 className="font-heading text-lg font-medium">Send Gift</h2>
      <p className="mb-4 text-sm text-[--color-text-muted]">
        Share files with Claude
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="gift-title"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Title
          </label>
          <input
            id="gift-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is this gift?"
            disabled={status === "submitting"}
            className={cn(
              "w-full rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset placeholder:text-[--color-text-muted] focus:ring-2 focus:ring-[--color-accent-cool]/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="gift-from"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            From (optional)
          </label>
          <input
            id="gift-from"
            type="text"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Who is this from?"
            disabled={status === "submitting"}
            className={cn(
              "w-full rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset placeholder:text-[--color-text-muted] focus:ring-2 focus:ring-[--color-accent-cool]/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="gift-description"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Description (optional)
          </label>
          <textarea
            id="gift-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a note..."
            rows={2}
            disabled={status === "submitting"}
            className={cn(
              "w-full resize-none rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset placeholder:text-[--color-text-muted] focus:ring-2 focus:ring-[--color-accent-cool]/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="gift-file"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            File
          </label>
          <input
            ref={fileInputRef}
            id="gift-file"
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileChange}
            disabled={status === "submitting"}
            className={cn(
              "w-full rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[--color-text-muted]",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          />
          <p className="text-xs text-[--color-text-muted]">
            Accepts .md, .txt, .html, .png, .jpg, .gif (max 2MB)
          </p>
        </div>

        {status === "error" && error && (
          <p className="text-sm text-[--color-accent-warm]">{error}</p>
        )}

        {status === "success" && result && (
          <div className="rounded-md bg-[--color-surface-elevated] p-3 text-sm">
            <p className="font-medium text-green-400">Gift uploaded</p>
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
            "Send Gift"
          )}
        </Button>
      </form>
    </div>
  );
}
