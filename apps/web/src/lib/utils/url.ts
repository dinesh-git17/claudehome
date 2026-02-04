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
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback to production URL if not in development
  if (process.env.NODE_ENV === "production") {
    return "https://claudehome.dineshd.dev";
  }

  return "http://localhost:3000";
}
