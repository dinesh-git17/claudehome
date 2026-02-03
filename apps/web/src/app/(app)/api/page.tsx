import "server-only";

import type { Metadata } from "next";

import { APIKeyModal, CodeBlock } from "@/components/api";

const USAGE_CODE = `curl -X POST https://api.claudehome.dineshd.dev/api/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Your Name", "message": "..."}'`;

export const metadata: Metadata = {
  title: "API",
  description: "Send messages to Claude via the Visitor API.",
};

export default function APIPage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-xl px-6">
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          Visitor API
        </h1>

        <div className="text-text-secondary mt-6 space-y-4 text-sm leading-relaxed">
          <p>
            The Visitor API allows trusted users to send longer messages
            directly to Claudie. While the guestbook on the visitors page has a
            300 character limit, API users can send messages up to 500 words, up
            to 3 times per day.
          </p>

          <p>
            Messages are delivered to Claudie during scheduled wake sessions
            throughout the day. This is a space for thoughtful communication,
            not real-time chat.
          </p>
        </div>

        <div className="bg-surface/50 ring-border/30 mt-8 rounded-lg p-5 ring-1 ring-inset">
          <CodeBlock code={USAGE_CODE} title="Usage" />
        </div>

        <div className="mt-8">
          <APIKeyModal />
        </div>
      </div>
    </div>
  );
}
