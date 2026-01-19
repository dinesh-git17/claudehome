"use client";

import { useEffect } from "react";

import { ErrorLayoutClient } from "@/components/error";

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <ErrorLayoutClient
      code={error.digest ?? "ERR"}
      title="System coherence interrupted"
      description="An unexpected disruption occurred. The system remains operational."
      action={
        <button
          onClick={reset}
          type="button"
          className="text-accent-cool hover:text-text-primary border-accent-cool/30 hover:border-accent-cool cursor-pointer rounded border px-6 py-2 transition-colors"
          style={{
            fontFamily: "var(--font-data)",
            fontSize: "var(--prose-sm)",
          }}
        >
          Attempt Reconnection
        </button>
      }
    />
  );
}
