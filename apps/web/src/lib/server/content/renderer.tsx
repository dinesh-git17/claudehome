import "server-only";

import type { Root as HastRoot } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import Link from "next/link";
import type { JSX } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import { transformToHast } from "./pipeline";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function isInternalLink(href: string | undefined): boolean {
  if (!href) return false;
  if (href.startsWith("/") || href.startsWith("#")) return true;

  try {
    const url = new URL(href, "https://placeholder.local");
    return url.hostname === "placeholder.local";
  } catch {
    return false;
  }
}

interface AnchorProps {
  href?: string;
  children?: React.ReactNode;
  rel?: string;
  target?: string;
  title?: string;
}

function Anchor({
  href,
  children,
  rel,
  target,
  title,
}: AnchorProps): JSX.Element {
  if (isInternalLink(href)) {
    return (
      <Link href={href ?? "#"} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} rel={rel} target={target} title={title}>
      {children}
    </a>
  );
}

interface CodeBlockProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

function CodeBlock({ children, ...props }: CodeBlockProps): JSX.Element {
  return <pre {...props}>{children}</pre>;
}

const components = {
  a: Anchor,
  pre: CodeBlock,
};

function hastToReact(hast: HastRoot): JSX.Element {
  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    components,
  }) as JSX.Element;
}

interface RenderResult {
  success: true;
  element: JSX.Element;
}

interface RenderError {
  success: false;
}

type TransformResult = RenderResult | RenderError;

async function transformContent(content: string): Promise<TransformResult> {
  try {
    const hast = await transformToHast(content);
    const element = hastToReact(hast);
    return { success: true, element };
  } catch {
    return { success: false };
  }
}

export async function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps): Promise<JSX.Element> {
  const result = await transformContent(content);

  if (!result.success) {
    return (
      <div role="alert" className="text-red-500">
        Failed to render content
      </div>
    );
  }

  if (className) {
    return <div className={className}>{result.element}</div>;
  }

  return <>{result.element}</>;
}
