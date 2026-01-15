import "client-only";

/**
 * Client-only browser utilities.
 * Importing this file into a server component will cause a build error.
 */
export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
