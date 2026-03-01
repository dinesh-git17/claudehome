"use client";

import "client-only";

import { LogIn, LogOut, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthState = "loading" | "unauthenticated" | "authenticated";

interface SessionData {
  display_name: string;
  unread: number;
  total: number;
}

export interface MailboxLoginProps {
  className?: string;
}

export function MailboxLogin({ className }: MailboxLoginProps) {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [session, setSession] = useState<SessionData | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession(): Promise<void> {
    try {
      const res = await fetch("/api/mailbox/session");
      const data: unknown = await res.json();
      const parsed = data as Record<string, unknown>;

      if (parsed.authenticated) {
        setSession({
          display_name: parsed.display_name as string,
          unread: parsed.unread as number,
          total: parsed.total as number,
        });
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
      }
    } catch {
      setAuthState("unauthenticated");
    }
  }

  async function handleLogin(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!password.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/mailbox/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body: unknown = await res.json().catch(() => ({}));
        const detail = (body as Record<string, unknown>).error;
        if (res.status === 429) {
          setError("Too many attempts. Try again later.");
        } else {
          setError(typeof detail === "string" ? detail : "Invalid password");
        }
        return;
      }

      setPassword("");
      await checkSession();
    } catch {
      setError("Connection failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout(): Promise<void> {
    await fetch("/api/mailbox/logout", { method: "POST" });
    setSession(null);
    setAuthState("unauthenticated");
  }

  if (authState === "loading") {
    return (
      <div
        className={cn(
          "bg-surface/50 ring-border/30 rounded-lg p-5 ring-1 ring-inset",
          className
        )}
      >
        <div className="text-text-tertiary flex items-center gap-2 text-sm">
          <Mail className="size-4" />
          <span>Checking mailbox...</span>
        </div>
      </div>
    );
  }

  if (authState === "authenticated" && session) {
    return (
      <div
        className={cn(
          "bg-surface/50 ring-border/30 rounded-lg p-5 ring-1 ring-inset",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <Mail className="text-accent-cool size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-text-primary truncate text-sm font-medium">
                {session.display_name}
              </p>
              <p className="text-text-tertiary text-xs">
                {session.unread > 0 ? (
                  <span className="text-accent-warm">
                    {session.unread} unread{" "}
                    {session.unread === 1 ? "message" : "messages"}
                  </span>
                ) : (
                  <span>{session.total} messages</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/mailbox">
                Open Mailbox
                {session.unread > 0 && (
                  <span className="bg-accent-warm text-void ml-1 inline-flex size-5 items-center justify-center rounded-full text-xs font-semibold">
                    {session.unread}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-surface/50 ring-border/30 rounded-lg p-5 ring-1 ring-inset",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Mail className="text-text-secondary size-4" />
        <p className="text-text-secondary text-sm">Sign in to your mailbox</p>
      </div>

      <form onSubmit={handleLogin} className="flex gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Web password (mb_...)"
          autoComplete="current-password"
          className={cn(
            "bg-void/50 ring-border/50 text-text-primary placeholder:text-text-tertiary flex-1 rounded-md px-3 py-2 text-sm ring-1 transition-colors outline-none ring-inset",
            "focus:ring-accent-cool/50 focus:ring-2",
            error && "ring-accent-warm/50"
          )}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!password.trim() || submitting}
          className="gap-1.5"
        >
          <LogIn className="size-4" />
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {error && <p className="text-accent-warm mt-2 text-xs">{error}</p>}
    </div>
  );
}
