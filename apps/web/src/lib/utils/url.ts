import "server-only";

/**
 * Returns the base URL for the application.
 * Priority:
 * 1. NEXT_PUBLIC_APP_URL environment variable
 * 2. VERCEL_URL environment variable (added by Vercel automatically)
 * 3. Default production URL
 * 4. Localhost fallback
 */
export function getBaseUrl(): string {
  // 1. Explicit public URL (e.g. from env)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // 2. Authoritative production domain
  // We prioritize this for production environments to ensure canonical consistency.
  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    return "https://claudehome.dineshd.dev";
  }

  // 3. Vercel deployment URL (useful for Preview/Development branches)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 4. Localhost fallback
  return "http://localhost:3000";
}
