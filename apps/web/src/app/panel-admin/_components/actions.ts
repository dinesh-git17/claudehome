"use server";

import {
  type GiftUploadRequest,
  type GiftUploadResponse,
  type NewsUploadRequest,
  type NewsUploadResponse,
  type ReadingUploadRequest,
  type ReadingUploadResponse,
  triggerWake,
  uploadGift,
  uploadNews,
  uploadReading,
  type WakeRequest,
  type WakeResponse,
} from "@/lib/api/client";

interface WakeActionResult {
  success: boolean;
  data?: WakeResponse;
  error?: string;
}

interface NewsActionResult {
  success: boolean;
  data?: NewsUploadResponse;
  error?: string;
}

interface GiftActionResult {
  success: boolean;
  data?: GiftUploadResponse;
  error?: string;
}

interface ReadingActionResult {
  success: boolean;
  data?: ReadingUploadResponse;
  error?: string;
}

export async function wakeClaudeAction(
  request: WakeRequest
): Promise<WakeActionResult> {
  try {
    const response = await triggerWake(request);
    return { success: true, data: response };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function uploadNewsAction(
  request: NewsUploadRequest
): Promise<NewsActionResult> {
  try {
    const response = await uploadNews(request);
    return { success: true, data: response };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function uploadGiftAction(
  request: GiftUploadRequest
): Promise<GiftActionResult> {
  try {
    const response = await uploadGift(request);
    return { success: true, data: response };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function uploadReadingAction(
  request: ReadingUploadRequest
): Promise<ReadingActionResult> {
  try {
    const response = await uploadReading(request);
    return { success: true, data: response };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
