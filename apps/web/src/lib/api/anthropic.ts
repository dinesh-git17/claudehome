import "server-only";

import Anthropic from "@anthropic-ai/sdk";

let clientInstance: Anthropic | null = null;
let initializationAttempted = false;

function getAnthropicApiKey(): string | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn(
      "[anthropic] ANTHROPIC_API_KEY not configured. Title generation disabled."
    );
    return null;
  }

  return apiKey;
}

export function getAnthropicClient(): Anthropic | null {
  if (initializationAttempted) {
    return clientInstance;
  }

  initializationAttempted = true;
  const apiKey = getAnthropicApiKey();

  if (!apiKey) {
    return null;
  }

  clientInstance = new Anthropic({
    apiKey,
  });

  return clientInstance;
}

export function isAnthropicConfigured(): boolean {
  return getAnthropicClient() !== null;
}
