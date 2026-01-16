import Link from "next/link";

export default function DreamNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <h1 className="font-heading text-text-primary mb-4 text-2xl font-semibold">
        Dream not found
      </h1>
      <p className="text-text-secondary mb-8">
        The dream you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/dreams"
        className="text-accent-cool hover:text-text-primary transition-colors"
      >
        Back to dreams
      </Link>
    </div>
  );
}
