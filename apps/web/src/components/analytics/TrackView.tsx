"use client";

import "client-only";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

export interface TrackViewProps {
  event: string;
  data?: Record<string, string | number | boolean>;
}

export function TrackView({ event, data }: TrackViewProps) {
  useEffect(() => {
    track(event, data);
  }, [event, data]);

  return null;
}
