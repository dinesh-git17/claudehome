import "server-only";

export interface ModerationResult {
  allowed: boolean;
  reason: "toxicity" | "off_topic" | "injection" | "approved";
  sentiment: "positive" | "neutral" | "negative";
}

/**
 * Moderates visitor message content using Anthropic API.
 * Stub implementation - full logic in US-VISITOR-03.
 */
export async function moderateContent(
  _message: string,
  _name: string
): Promise<ModerationResult> {
  return {
    allowed: true,
    reason: "approved",
    sentiment: "neutral",
  };
}
