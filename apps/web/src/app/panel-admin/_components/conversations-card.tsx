"use client";

import "client-only";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ConversationItem } from "@/lib/api/client";
import { cn } from "@/lib/utils";

import { fetchConversationsAction } from "./actions";

type Status = "idle" | "loading" | "success" | "error";

interface ConversationsCardProps {
  initialConversations: ConversationItem[];
  initialTotal: number;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\u2026";
}

export function ConversationsCard({
  initialConversations,
  initialTotal,
}: ConversationsCardProps) {
  const [conversations, setConversations] =
    useState<ConversationItem[]>(initialConversations);
  const [total, setTotal] = useState(initialTotal);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  async function refresh() {
    setStatus("loading");
    setError(null);

    const result = await fetchConversationsAction(3);

    if (result.success && result.data) {
      setConversations(result.data.conversations);
      setTotal(result.data.total);
      setStatus("idle");
    } else {
      setStatus("error");
      setError(result.error ?? "Failed to load conversations");
    }
  }

  function toggleExpanded(index: number) {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  return (
    <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-medium">Conversations</h2>
          <p className="text-sm text-[--color-text-muted]">
            Recent session responses
            <span className="ml-1">({total} total)</span>
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => void refresh()}
          disabled={status === "loading"}
          aria-label="Refresh conversations"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={cn("size-4", status === "loading" && "animate-spin")}
          >
            <path
              fillRule="evenodd"
              d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.681.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-.908l.84.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44.908l-.84-.84v1.68a.75.75 0 0 1-1.5 0V9.565a.75.75 0 0 1 .75-.75h3.182a.75.75 0 0 1 0 1.5h-1.37l.84.841a4.5 4.5 0 0 0 7.08-.681.75.75 0 0 1 1.024-.274Z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>

      {status === "loading" && (
        <div className="flex items-center justify-center py-8">
          <span
            className="size-5 animate-spin rounded-full border-2 border-[--color-text-muted] border-t-transparent"
            aria-hidden="true"
          />
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-[--color-accent-warm]">{error}</p>
      )}

      {status !== "loading" && conversations.length > 0 && (
        <ul className="space-y-2">
          {conversations.map((conversation, index) => (
            <li key={conversation.filename}>
              <button
                type="button"
                onClick={() => toggleExpanded(index)}
                className="w-full rounded-md bg-[--color-void]/30 px-3 py-2 text-left transition-colors hover:bg-[--color-void]/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-snug font-medium">
                    {truncate(conversation.message, 80)}
                  </p>
                  <span className="shrink-0 text-xs text-[--color-text-muted]">
                    {formatDate(conversation.date)}
                  </span>
                </div>
                {conversation.session_type !== "custom" && (
                  <span className="mt-1 inline-block rounded-full bg-[--color-surface-elevated] px-2 py-0.5 text-xs text-[--color-text-muted]">
                    {conversation.session_type}
                  </span>
                )}
              </button>

              {expandedIndex === index && (
                <div className="mt-1 rounded-md bg-[--color-surface-elevated] p-3">
                  <p className="mb-2 text-xs font-medium tracking-wide text-[--color-text-muted] uppercase">
                    Response
                  </p>
                  <div className="max-h-64 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
                    {conversation.response}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {status !== "loading" && conversations.length === 0 && (
        <p className="py-4 text-center text-sm text-[--color-text-muted]">
          No conversations found
        </p>
      )}
    </div>
  );
}
