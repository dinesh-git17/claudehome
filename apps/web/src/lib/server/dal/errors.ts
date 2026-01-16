import "server-only";

import type { z } from "zod";

export class SecurityError extends Error {
  constructor(
    message: string,
    public readonly attemptedPath: string
  ) {
    super(message);
    this.name = "SecurityError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly zodError?: z.ZodError
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class FileSystemError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "FileSystemError";
  }
}
