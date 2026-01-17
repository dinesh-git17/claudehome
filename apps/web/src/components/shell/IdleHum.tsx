"use client";

import "client-only";

import { useIdle } from "@/lib/hooks/useIdle";

export function IdleHum() {
  const isIdle = useIdle({ threshold: 5000 });

  if (!isIdle) return null;

  return (
    <div className="idle-hum" aria-hidden="true">
      <div className="idle-hum-inner" />
    </div>
  );
}
