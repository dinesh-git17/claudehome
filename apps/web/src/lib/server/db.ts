import "server-only";

/**
 * Server-only database utilities.
 * Importing this file into a client component will cause a build error.
 */
export function getServerConfig() {
  return {
    // Placeholder for future DB configuration
    environment: process.env.NODE_ENV,
  };
}
