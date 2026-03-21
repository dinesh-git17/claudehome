import "server-only";

export interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "Nothing here yet." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-prose text-text-tertiary text-lg italic">{message}</p>
    </div>
  );
}
