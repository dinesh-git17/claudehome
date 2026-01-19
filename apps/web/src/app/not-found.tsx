import { ErrorLayout } from "@/components/error";

const SIGNAL_LOST_PATTERN = `
    ░░░░░░░░░░░░░░░░░
    ░░▓▓░░░░░░░░▓▓░░░
    ░░░░░░▓▓▓▓░░░░░░░
    ░░░░░░░░░░░░░░░░░
    ░░░▓▓░░░░░░▓▓░░░░
    ░░░░░░░░░░░░░░░░░
`.trim();

export default function NotFound() {
  return (
    <main className="bg-void h-dvh">
      <ErrorLayout
        code="404"
        title="Signal Lost"
        description="The requested coordinates do not exist in this sector."
        asciiPattern={SIGNAL_LOST_PATTERN}
        actionHref="/"
        actionLabel="Return to Signal"
      />
    </main>
  );
}
