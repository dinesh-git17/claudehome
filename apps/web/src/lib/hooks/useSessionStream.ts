"use client";

import "client-only";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";

const STREAM_ENDPOINT =
  "https://api.claudehome.dineshd.dev/api/v1/session/stream";

const SessionStartSchema = z.object({
  session_id: z.string(),
  model: z.string(),
  turn: z.number(),
});

const SessionTextSchema = z.object({
  text: z.string(),
});

const SessionToolSchema = z.object({
  tool_name: z.string(),
  summary: z.string(),
  input: z.string().optional(),
});

const SessionToolResultSchema = z.object({
  tool_name: z.string(),
  content: z.string(),
  is_error: z.boolean(),
});

const SessionEndSchema = z.object({
  duration_ms: z.number(),
  num_turns: z.number(),
  cost_usd: z.number(),
  result: z.string().optional(),
});

export type SessionStartData = z.infer<typeof SessionStartSchema>;
export type SessionTextData = z.infer<typeof SessionTextSchema>;
export type SessionToolData = z.infer<typeof SessionToolSchema>;
export type SessionToolResultData = z.infer<typeof SessionToolResultSchema>;
export type SessionEndData = z.infer<typeof SessionEndSchema>;

export type SessionStreamEvent =
  | { type: "session.start"; data: SessionStartData; receivedAt: number }
  | { type: "session.text"; data: SessionTextData; receivedAt: number }
  | { type: "session.tool"; data: SessionToolData; receivedAt: number }
  | {
      type: "session.tool_result";
      data: SessionToolResultData;
      receivedAt: number;
    }
  | { type: "session.end"; data: SessionEndData; receivedAt: number };

const SCHEMA_MAP: Record<string, z.ZodSchema> = {
  "session.start": SessionStartSchema,
  "session.text": SessionTextSchema,
  "session.tool": SessionToolSchema,
  "session.tool_result": SessionToolResultSchema,
  "session.end": SessionEndSchema,
};

const EVENT_TYPES = Object.keys(SCHEMA_MAP);

export function useSessionStream(enabled: boolean): SessionStreamEvent[] {
  const [events, setEvents] = useState<SessionStreamEvent[]>([]);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) {
      sourceRef.current?.close();
      sourceRef.current = null;
      return;
    }

    const source = new EventSource(STREAM_ENDPOINT);
    sourceRef.current = source;

    source.addEventListener("open", () => {
      setEvents([]);
    });

    for (const eventType of EVENT_TYPES) {
      source.addEventListener(eventType, (e: Event) => {
        const messageEvent = e as MessageEvent;
        try {
          const raw: unknown = JSON.parse(messageEvent.data as string);
          const schema = SCHEMA_MAP[eventType];
          if (!schema) return;

          const parsed = schema.safeParse(raw);
          if (!parsed.success) return;

          setEvents((prev) => [
            ...prev,
            {
              type: eventType as SessionStreamEvent["type"],
              data: parsed.data,
              receivedAt: Date.now(),
            } as SessionStreamEvent,
          ]);
        } catch {
          // Malformed JSON — skip
        }
      });
    }

    return () => {
      source.close();
      sourceRef.current = null;
    };
  }, [enabled]);

  return enabled ? events : [];
}
