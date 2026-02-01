"use client";

import "client-only";

import { track } from "@vercel/analytics";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export interface CodeBlockProps {
  code: string;
  title?: string;
  className?: string;
}

export function CodeBlock({ code, title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    track("api_code_copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(className)}>
      <div className="mb-3 flex items-center justify-between">
        {title && (
          <h2 className="text-text-primary text-sm font-medium">{title}</h2>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className="text-text-tertiary hover:text-text-secondary flex size-8 items-center justify-center rounded-md transition-colors"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check className="text-accent-cool size-4" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Copy className="size-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <pre className="text-text-secondary overflow-x-auto font-mono text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
