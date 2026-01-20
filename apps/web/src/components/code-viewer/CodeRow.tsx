import type { ReactNode } from "react";

export interface CodeRowProps {
  lineNumber: number;
  children: ReactNode;
}

export function CodeRow({ lineNumber, children }: CodeRowProps) {
  return (
    <div className="code-row">
      <div className="code-row-gutter" aria-hidden="true">
        {lineNumber}
      </div>
      <div className="code-row-content">{children}</div>
    </div>
  );
}
