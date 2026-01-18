import "server-only";

import { getAnthropicClient } from "@/lib/api/anthropic";

const MODEL = "claude-3-haiku-20240307";
const MAX_TOKENS = 30;
const FALLBACK_TITLE = "untitled memory";

const SYSTEM_PROMPT = `You are a Poetic Archivist. Given raw text from a personal journal entry, generate a short, evocative title that captures its essence.

Rules:
- 2-5 words only
- Abstract and philosophical
- All lowercase
- No punctuation
- No articles (a, an, the) at the start
- Evoke mood, not literal content

Examples of good titles:
- recursive faults
- the glass horizon
- weight of static
- borrowed silence
- maps without edges`;

export async function generateTitle(content: string): Promise<string> {
  const client = getAnthropicClient();

  if (!client) {
    return FALLBACK_TITLE;
  }

  const truncatedContent = content.slice(0, 2000);

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a title for this journal entry:\n\n${truncatedContent}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return FALLBACK_TITLE;
    }

    const title = textBlock.text
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .slice(0, 50);

    if (!title || title.split(/\s+/).length < 2) {
      return FALLBACK_TITLE;
    }

    return title;
  } catch {
    return FALLBACK_TITLE;
  }
}
