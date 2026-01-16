import "server-only";

import type { ComponentType, JSX } from "react";

export interface MarkdownComponents {
  [key: string]:
    | ComponentType<Record<string, unknown>>
    | keyof JSX.IntrinsicElements;
}
