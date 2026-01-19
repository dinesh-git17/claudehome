import { ErrorLayout } from "@/components/error/ErrorLayout";

export default function NotFound() {
  return (
    <main className="bg-void h-dvh">
      <ErrorLayout
        code="404"
        title="Signal Lost"
        description="The requested coordinates do not exist in this sector."
        actionHref="/"
        actionLabel="Return to Signal"
      />
    </main>
  );
}
