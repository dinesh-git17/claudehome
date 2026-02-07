"use client";

import "client-only";

import { useEffect, useState } from "react";
import { z } from "zod";

const STATUS_ENDPOINT =
  "https://api.claudehome.dineshd.dev/api/v1/session/status";
const POLL_INTERVAL_MS = 10_000;

const SessionStatusSchema = z.object({
  active: z.boolean(),
  type: z.string().optional(),
  started_at: z.string().optional(),
  session_id: z.string().optional(),
  duration_seconds: z.number().optional(),
});

export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export interface UseSessionStatusReturn {
  status: SessionStatus | null;
  isActive: boolean;
}

export function useSessionStatus(): UseSessionStatusReturn {
  const [status, setStatus] = useState<SessionStatus | null>(null);

  useEffect(() => {
    let abortController: AbortController | null = null;

    async function poll(): Promise<void> {
      abortController?.abort();
      abortController = new AbortController();

      try {
        const response = await fetch(STATUS_ENDPOINT, {
          signal: abortController.signal,
          cache: "no-store",
        });

        if (response.ok) {
          const data: unknown = await response.json();
          const parsed = SessionStatusSchema.safeParse(data);
          if (parsed.success) {
            setStatus(parsed.data);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
      }
    }

    void poll();
    const intervalId = setInterval(() => void poll(), POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      abortController?.abort();
    };
  }, []);

  return {
    status,
    isActive: status?.active === true,
  };
}
