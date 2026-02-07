"use client";

import { motion, useReducedMotion } from "framer-motion";

import type {
  SessionEndData,
  SessionStartData,
  SessionStreamEvent,
  SessionTextData,
  SessionToolData,
  SessionToolResultData,
} from "@/lib/hooks/useSessionStream";
import { cn } from "@/lib/utils";

import { TypewriterText } from "./TypewriterText";

export interface StreamEventProps {
  event: SessionStreamEvent;
  isLatest: boolean;
}

const VARIANTS_EVENT = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

const VARIANTS_REDUCED = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

export function StreamEvent({ event, isLatest }: StreamEventProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? VARIANTS_REDUCED : VARIANTS_EVENT;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {event.type === "session.start" && <StartEvent data={event.data} />}
      {event.type === "session.text" && (
        <TextEvent data={event.data} animate={isLatest} />
      )}
      {event.type === "session.tool" && <ToolEvent data={event.data} />}
      {event.type === "session.tool_result" && (
        <ToolResultEvent data={event.data} />
      )}
      {event.type === "session.end" && <EndEvent data={event.data} />}
    </motion.div>
  );
}

interface StartEventProps {
  data: SessionStartData;
}

function StartEvent({ data }: StartEventProps) {
  return (
    <div className="text-text-tertiary font-data flex items-center gap-2 py-2 text-xs">
      <span className="bg-accent-success inline-block size-1.5 rounded-full" />
      <span>session started · {data.model}</span>
    </div>
  );
}

interface TextEventProps {
  data: SessionTextData;
  animate: boolean;
}

function TextEvent({ data, animate }: TextEventProps) {
  return (
    <div className="py-2">
      {animate ? (
        <TypewriterText
          text={data.text}
          className="text-text-primary font-data text-sm leading-relaxed whitespace-pre-wrap"
        />
      ) : (
        <span className="text-text-primary font-data text-sm leading-relaxed whitespace-pre-wrap">
          {data.text}
        </span>
      )}
    </div>
  );
}

interface ToolEventProps {
  data: SessionToolData;
}

function ToolEvent({ data }: ToolEventProps) {
  const icon = getToolIcon(data.tool_name);

  return (
    <div className="py-1.5">
      <span
        className={cn(
          "bg-surface inline-flex items-center gap-1.5 rounded px-2 py-1",
          "font-data text-text-secondary text-xs"
        )}
      >
        <span aria-hidden="true">{icon}</span>
        <span>{data.summary}</span>
      </span>
    </div>
  );
}

interface ToolResultEventProps {
  data: SessionToolResultData;
}

function ToolResultEvent({ data }: ToolResultEventProps) {
  return (
    <details className="group py-1">
      <summary
        className={cn(
          "font-data text-text-tertiary cursor-pointer text-xs",
          "hover:text-text-secondary list-none transition-colors select-none",
          data.is_error && "text-accent-warm"
        )}
      >
        <span className="group-open:hidden">▸ result</span>
        <span className="hidden group-open:inline">▾ result</span>
        {data.is_error && <span className="ml-1">(error)</span>}
      </summary>
      <pre
        className={cn(
          "bg-surface mt-1 overflow-x-auto rounded p-3",
          "font-data text-text-secondary text-xs leading-relaxed",
          "max-h-48 overflow-y-auto"
        )}
      >
        {data.content}
      </pre>
    </details>
  );
}

interface EndEventProps {
  data: SessionEndData;
}

function EndEvent({ data }: EndEventProps) {
  const durationSec = Math.round(data.duration_ms / 1000);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;

  return (
    <div className="border-surface text-text-tertiary font-data mt-2 border-t pt-2 text-xs">
      session ended · {data.num_turns} turns · {minutes}m {seconds}s
    </div>
  );
}

function getToolIcon(toolName: string): string {
  switch (toolName.toLowerCase()) {
    case "read":
      return "◇";
    case "write":
      return "◆";
    case "edit":
      return "▪";
    case "bash":
      return "▹";
    case "glob":
    case "grep":
      return "○";
    default:
      return "·";
  }
}
