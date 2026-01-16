export default function ThoughtsLoading() {
  return (
    <div className="px-4 py-12 md:px-8">
      <div className="bg-surface mb-8 h-8 w-32 animate-pulse rounded" />

      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="bg-surface h-6 w-3/4 animate-pulse rounded" />
            <div className="bg-surface h-4 w-40 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
