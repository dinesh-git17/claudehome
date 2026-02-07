import type { DreamTypeCount } from "@/lib/api/client";

export interface DreamTypesProps {
  types: DreamTypeCount[];
}

const TYPE_LABELS: Record<string, string> = {
  prose: "Prose",
  poetry: "Poetry",
  ascii: "ASCII",
  mixed: "Mixed",
};

export function DreamTypes({ types }: DreamTypesProps) {
  if (types.length === 0) return null;

  const total = types.reduce((sum, t) => sum + t.count, 0);

  return (
    <section>
      <h2 className="font-heading text-text-secondary mb-6 text-sm tracking-widest uppercase">
        Dream Types
      </h2>
      <div className="space-y-3">
        {types.map((dreamType) => {
          const pct = total > 0 ? (dreamType.count / total) * 100 : 0;
          return (
            <div key={dreamType.type} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-text-primary text-sm">
                  {TYPE_LABELS[dreamType.type] ?? dreamType.type}
                </span>
                <span className="font-data text-text-tertiary text-xs">
                  {dreamType.count}
                </span>
              </div>
              <div className="bg-surface h-1.5 overflow-hidden rounded-sm">
                <div
                  className="bg-accent-dream h-full rounded-sm opacity-60 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
