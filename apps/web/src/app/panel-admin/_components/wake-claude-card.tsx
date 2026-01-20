"use client";

import "client-only";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { WakeSessionType } from "@/lib/api/client";
import { cn } from "@/lib/utils";

import { wakeClaudeAction } from "./actions";

const SESSION_TYPES: { value: WakeSessionType; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "late_night", label: "Late Night" },
  { value: "custom", label: "Custom" },
];

type Status = "idle" | "submitting" | "success" | "error";

interface WakeResult {
  session_id: string;
  log_file: string;
}

export function WakeClaudeCard() {
  const [sessionType, setSessionType] = useState<WakeSessionType>("custom");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WakeResult | null>(null);

  const canSubmit = status !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    setResult(null);

    const response = await wakeClaudeAction({
      session_type: sessionType,
      prompt: prompt.trim() || undefined,
    });

    if (response.success && response.data) {
      setStatus("success");
      setResult({
        session_id: response.data.session_id,
        log_file: response.data.log_file,
      });
      setPrompt("");
    } else {
      setStatus("error");
      setError(response.error ?? "Failed to trigger wake session");
    }
  }

  return (
    <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
      <h2 className="font-heading text-lg font-medium">Wake Claude</h2>
      <p className="mb-4 text-sm text-[--color-text-muted]">
        Trigger a manual wake session
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="session-type"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Session Type
          </label>
          <select
            id="session-type"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value as WakeSessionType)}
            disabled={status === "submitting"}
            className={cn(
              "w-full rounded-md border-0 bg-[--color-void]/50 px-3 py-2 text-sm text-[--color-text] ring-1 ring-[--color-border]/50 transition-shadow outline-none ring-inset focus:ring-2 focus:ring-[--color-accent-cool]/20",
              status === "submitting" && "cursor-not-allowed opacity-60"
            )}
          >
            {SESSION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="wake-prompt"
            className="text-xs font-medium tracking-wide text-[--color-text-muted] uppercase"
          >
            Prompt {sessionType !== "custom" && "(optional override)"}
          </label>
          <textarea
            id="wake-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              sessionType === "custom"
                ? "Enter a custom prompt for Claude..."
                : "Leave empty to use default session prompt"
            }
            rows={4}
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
            <p className="font-medium text-green-400">Session started</p>
            <dl className="mt-2 space-y-1 text-xs text-[--color-text-muted]">
              <div className="flex gap-2">
                <dt>ID:</dt>
                <dd className="font-data">{result.session_id}</dd>
              </div>
              <div className="flex gap-2">
                <dt>Log:</dt>
                <dd className="font-data truncate">{result.log_file}</dd>
              </div>
            </dl>
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
              Starting...
            </span>
          ) : (
            "Wake Claude"
          )}
        </Button>
      </form>
    </div>
  );
}
