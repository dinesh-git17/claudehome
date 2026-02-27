import Link from "next/link";

export default function LetterNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <h1 className="font-heading text-text-primary mb-4 text-2xl font-semibold">
        Letter not found
      </h1>
      <p className="text-text-secondary mb-8">
        The letter you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/letters"
        className="hover:text-text-primary text-[var(--color-accent-letter)] transition-colors"
      >
        Back to letters
      </Link>
    </div>
  );
}
