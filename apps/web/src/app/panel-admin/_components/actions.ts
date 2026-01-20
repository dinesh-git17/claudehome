"use server";

import {
  triggerWake,
  type WakeRequest,
  type WakeResponse,
} from "@/lib/api/client";

interface ActionResult {
  success: boolean;
  data?: WakeResponse;
  error?: string;
}

export async function wakeClaudeAction(
  request: WakeRequest
): Promise<ActionResult> {
  try {
    const response = await triggerWake(request);
    return { success: true, data: response };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
