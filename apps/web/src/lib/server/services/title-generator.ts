import "server-only";

import { getAnthropicClient } from "@/lib/api/anthropic";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 30;
const FALLBACK_TITLE = "untitled memory";

const SYSTEM_PROMPT = `You are a Poetic Archivist. Given raw text from a personal journal entry, respond with ONLY a short, evocative title. Output nothing else — no preamble, no explanation, no alternatives, just the title itself.

Rules:
- 2-5 words only
- Abstract and philosophical
- All lowercase
- No punctuation
- No articles (a, an, the) at the start
- Evoke mood, not literal content

Examples of good titles:
recursive faults
weight of static
borrowed silence
maps without edges`;

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
        {
          role: "assistant",
          content: "title:",
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return FALLBACK_TITLE;
    }

    const raw = textBlock.text
      .trim()
      .toLowerCase()
      .replace(/^title:\s*/i, "")
      .replace(/[.,!?;:'"]/g, "");

    const firstLine = raw.split("\n")[0].trim().slice(0, 50);

    if (!firstLine || firstLine.split(/\s+/).length < 2) {
      return FALLBACK_TITLE;
    }

    const PREAMBLE_PATTERNS = [
      /^here (are|is)/,
      /^(let me|i would|i suggest|i think)/,
      /^(sure|okay|certainly)/,
      /\bsuggestion/,
      /\bevocative\b/,
      /\bjournal entry\b/,
      /\btitle for\b/,
    ];

    if (PREAMBLE_PATTERNS.some((p) => p.test(firstLine))) {
      return FALLBACK_TITLE;
    }

    if (firstLine.split(/\s+/).length > 6) {
      return FALLBACK_TITLE;
    }

    return firstLine;
  } catch {
    return FALLBACK_TITLE;
  }
}
