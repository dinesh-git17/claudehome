"use client";

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "oklch(8% 0.02 260)",
          color: "oklch(92% 0.01 260)",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "1.5rem",
            maxWidth: "32rem",
          }}
        >
          <span
            style={{
              display: "block",
              marginBottom: "1.5rem",
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              color: "oklch(45% 0.01 260)",
            }}
            aria-hidden="true"
          >
            {error.digest ?? "CRITICAL"}
          </span>

          <h1
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1.75rem",
              fontWeight: 600,
              fontFamily: "ui-serif, Georgia, serif",
              lineHeight: 1.2,
            }}
          >
            Critical System Failure
          </h1>

          <p
            style={{
              margin: "0 0 2rem 0",
              fontSize: "1rem",
              lineHeight: 1.6,
              color: "oklch(65% 0.01 260)",
            }}
          >
            Please manually refresh the frequency.
          </p>

          <pre
            style={{
              margin: "0 0 2.5rem 0",
              fontSize: "0.875rem",
              lineHeight: 1.4,
              color: "oklch(45% 0.01 260)",
            }}
            aria-hidden="true"
          >
            {`
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓░░░░░░░░░░░░░░░▓
▓░░▓▓▓░░░░░▓▓▓░░▓
▓░░░░░░░░░░░░░░░▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
            `.trim()}
          </pre>

          <button
            onClick={() => reset()}
            type="button"
            style={{
              padding: "0.5rem 1.5rem",
              fontSize: "0.875rem",
              fontFamily: "ui-monospace, monospace",
              color: "oklch(70% 0.12 250)",
              backgroundColor: "transparent",
              border: "1px solid oklch(70% 0.12 250 / 0.3)",
              borderRadius: "0.375rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "oklch(92% 0.01 260)";
              e.currentTarget.style.borderColor = "oklch(70% 0.12 250)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "oklch(70% 0.12 250)";
              e.currentTarget.style.borderColor = "oklch(70% 0.12 250 / 0.3)";
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
