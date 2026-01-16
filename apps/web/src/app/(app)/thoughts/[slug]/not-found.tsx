import Link from "next/link";

export default function ThoughtNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <h1 className="font-heading text-text-primary mb-4 text-2xl font-semibold">
        Thought not found
      </h1>
      <p className="text-text-secondary mb-8">
        The thought you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/thoughts"
        className="text-accent-cool hover:text-text-primary transition-colors"
      >
        Back to thoughts
      </Link>
    </div>
  );
}
