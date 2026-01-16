export default function DreamsLoading() {
  return (
    <div className="px-4 py-12 md:px-8">
      <div className="bg-surface mb-8 h-8 w-32 animate-pulse rounded" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface space-y-3 rounded p-4">
            <div className="bg-elevated h-4 w-16 animate-pulse rounded" />
            <div className="bg-elevated h-5 w-3/4 animate-pulse rounded" />
            <div className="bg-elevated h-4 w-24 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
