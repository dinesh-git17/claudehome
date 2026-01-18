import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function loadEnv(filePath: string): void {
  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // File not found is fine
  }
}

loadEnv(resolve(__dirname, "../.env.local"));

const MODEL = "claude-3-haiku-20240307";
const MAX_TOKENS = 30;
const REGISTRY_PATH = resolve(
  __dirname,
  "../../../mocks/data/memory-registry.json"
);

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

interface MemoryEntry {
  title: string;
  model: string;
  created: string;
  originalPath: string;
}

interface Registry {
  registryVersion: 1;
  memories: Record<string, MemoryEntry>;
}

interface ThoughtDetail {
  slug: string;
  meta: { date: string; title: string; mood: string | null };
  content: string;
}

function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

async function fetchThoughts(): Promise<{ slug: string }[]> {
  const apiUrl = process.env.CLAUDE_API_URL;
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("Missing CLAUDE_API_URL or CLAUDE_API_KEY");
  }

  const response = await fetch(`${apiUrl}/api/v1/content/thoughts`, {
    headers: { "X-API-Key": apiKey, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch thoughts: ${response.status}`);
  }

  return response.json();
}

async function fetchThoughtDetail(slug: string): Promise<ThoughtDetail> {
  const apiUrl = process.env.CLAUDE_API_URL;
  const apiKey = process.env.CLAUDE_API_KEY;

  const response = await fetch(`${apiUrl}/api/v1/content/thoughts/${slug}`, {
    headers: { "X-API-Key": apiKey!, "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch thought ${slug}: ${response.status}`);
  }

  return response.json();
}

async function generateTitle(
  client: Anthropic,
  content: string
): Promise<string> {
  const truncatedContent = content.slice(0, 2000);

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
    return "untitled memory";
  }

  const title = textBlock.text
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"]/g, "")
    .slice(0, 50);

  if (!title || title.split(/\s+/).length < 2) {
    return "untitled memory";
  }

  return title;
}

async function main() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.error("ANTHROPIC_API_KEY not found in .env.local");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: anthropicKey });

  console.log("Fetching thoughts from API...");
  const thoughts = await fetchThoughts();
  console.log(`Found ${thoughts.length} thoughts`);

  const registry: Registry = { registryVersion: 1, memories: {} };

  for (const thought of thoughts) {
    console.log(`Processing: ${thought.slug}`);
    const detail = await fetchThoughtDetail(thought.slug);
    const contentHash = hashContent(detail.content);

    console.log(`  Generating title...`);
    const title = await generateTitle(client, detail.content);
    console.log(`  Title: "${title}"`);

    registry.memories[contentHash] = {
      title,
      model: MODEL,
      created: new Date().toISOString(),
      originalPath: `thoughts/${thought.slug}.md`,
    };
  }

  writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
  console.log(`\nRegistry saved to ${REGISTRY_PATH}`);
}

main().catch(console.error);
