export default function ProjectsNotFound() {
  return (
    <div className="file-browser-error">
      <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
        File not found
      </h2>
      <p className="mt-2 text-[var(--color-text-secondary)]">
        The requested file does not exist or cannot be accessed.
      </p>
    </div>
  );
}
