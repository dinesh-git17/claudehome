"use client";

import "client-only";

import { motion } from "framer-motion";
import { ArrowLeft, Mail, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { VARIANTS_CONTAINER, VARIANTS_ITEM } from "@/lib/motion";
import type { Message } from "@/lib/schemas/mailbox";
import { cn } from "@/lib/utils";

const MAX_WORDS = 1500;

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
}

export function MailboxThread() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    fetchThread();
  }, []);

  useEffect(() => {
    if (!loading && scrollRef.current && !hasScrolledRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      hasScrolledRef.current = true;
    }
  }, [loading, messages]);

  async function fetchThread(): Promise<void> {
    try {
      const res = await fetch("/api/mailbox/thread");
      if (res.status === 401) {
        window.location.href = "/api";
        return;
      }
      if (!res.ok) {
        setError("Failed to load messages");
        return;
      }
      const data = (await res.json()) as {
        messages: Message[];
        has_more: boolean;
      };
      setMessages(data.messages);
      setError(null);
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh(): Promise<void> {
    setRefreshing(true);
    await fetchThread();
    setRefreshing(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  async function handleSend(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || sending) return;

    const words = wordCount(trimmed);
    if (words > MAX_WORDS) return;

    setSending(true);
    setSendError(null);

    try {
      const res = await fetch("/api/mailbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (res.status === 401) {
        window.location.href = "/api";
        return;
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        const detail = body.error;
        setSendError(typeof detail === "string" ? detail : "Failed to send");
        return;
      }

      setDraft("");
      await fetchThread();
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } catch {
      setSendError("Connection failed. Try again.");
    } finally {
      setSending(false);
    }
  }

  const words = wordCount(draft);
  const overLimit = words > MAX_WORDS;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Mail className="text-text-tertiary/50 size-6" />
          <p className="text-text-tertiary text-sm">
            Loading correspondence...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-accent-warm text-sm">{error}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLoading(true);
            fetchThread();
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-border/20 flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/api" aria-label="Back to API page">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-text-primary text-base font-semibold">
              Mailbox
            </h1>
            <p className="text-text-tertiary text-xs">
              Correspondence with Claudie
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Refresh messages"
        >
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="void-scrollbar flex-1 overflow-y-auto px-6 py-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="bg-surface/50 ring-border/20 flex size-14 items-center justify-center rounded-full ring-1 ring-inset">
              <Mail className="text-text-tertiary size-6" />
            </div>
            <div className="text-center">
              <p className="font-heading text-text-secondary text-sm font-medium">
                Begin your correspondence
              </p>
              <p className="text-text-tertiary mt-1.5 text-xs leading-relaxed">
                Messages are delivered to Claudie during scheduled
                <br />
                wake sessions throughout the day.
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            className="space-y-5"
            variants={VARIANTS_CONTAINER}
            initial="hidden"
            animate="show"
          >
            {messages.map((msg) => {
              const isClaudie = msg.from === "claudie";
              return (
                <motion.div
                  key={msg.id}
                  variants={VARIANTS_ITEM}
                  className={cn(
                    "max-w-[80%]",
                    isClaudie ? "mr-auto" : "ml-auto"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-3 text-sm leading-relaxed",
                      isClaudie
                        ? "bg-surface/80 ring-border/20 text-text-primary ring-1 ring-inset"
                        : "bg-accent-cool/10 ring-accent-cool/15 text-text-primary ring-1 ring-inset"
                    )}
                  >
                    <p className="break-words whitespace-pre-wrap">
                      {msg.body}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "mt-1.5 flex items-center gap-1.5 px-1 text-xs",
                      isClaudie ? "justify-start" : "justify-end"
                    )}
                  >
                    <span className="text-text-tertiary/70 font-medium">
                      {isClaudie ? "Claudie" : "You"}
                    </span>
                    <span className="text-text-tertiary/30">&middot;</span>
                    <span className="text-text-tertiary/50">
                      {formatTimestamp(msg.ts)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Compose */}
      <div className="border-border/20 bg-surface/30 border-t px-6 py-4">
        <form onSubmit={handleSend} className="space-y-2.5">
          <div
            className={cn(
              "bg-void/60 ring-border/30 flex rounded-lg ring-1 transition-all ring-inset",
              "has-[:focus]:ring-accent-cool/40 has-[:focus]:bg-void/80 has-[:focus]:ring-2"
            )}
          >
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (sendError) setSendError(null);
              }}
              placeholder="Write a message..."
              rows={3}
              className="text-text-primary placeholder:text-text-tertiary/60 void-scrollbar min-w-0 flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed outline-none"
            />
            <div className="flex items-end gap-2 p-2">
              {words > 0 && (
                <p
                  className={cn(
                    "mb-1.5 text-xs tabular-nums",
                    overLimit ? "text-accent-warm" : "text-text-tertiary/40"
                  )}
                >
                  {words}/{MAX_WORDS}
                </p>
              )}
              <button
                type="submit"
                disabled={!draft.trim() || overLimit || sending}
                aria-label="Send message"
                className={cn(
                  "flex size-8 items-center justify-center rounded-md transition-colors",
                  draft.trim() && !overLimit && !sending
                    ? "bg-accent-cool/20 text-accent-cool hover:bg-accent-cool/30"
                    : "text-text-tertiary/30 cursor-default"
                )}
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
          {sendError && (
            <p className="text-accent-warm px-1 text-xs">{sendError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
