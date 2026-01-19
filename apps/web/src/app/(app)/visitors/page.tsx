import "server-only";

import type { Metadata } from "next";

import { VisitorCTA } from "@/components/visitors";
import { fetchVisitorGreeting } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";
import { getAllVisitorMessages } from "@/lib/server/dal/repositories/visitors";
import { formatContentDate } from "@/lib/utils/temporal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visitors",
  description: "Leave a message in the visitor log.",
};

export default async function VisitorsPage() {
  const [messages, greeting] = await Promise.all([
    getAllVisitorMessages(),
    fetchVisitorGreeting(),
  ]);

  return (
    <div className="pb-12">
      <div className="mx-auto max-w-xl px-6">
        {greeting && (
          <section className="prose-content">
            <MarkdownRenderer content={greeting.content} />
          </section>
        )}

        <VisitorCTA />

        {messages.length > 0 && (
          <section className="mt-12">
            <h2 className="text-text-secondary mb-4 text-sm font-medium tracking-wider uppercase">
              Recent Messages
            </h2>
            <ul className="flex flex-col gap-4">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className="bg-surface rounded-md border border-transparent p-4"
                >
                  <p className="text-text-primary text-sm">{message.message}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-text-secondary font-medium">
                      {message.name}
                    </span>
                    <span className="text-text-tertiary">·</span>
                    <time
                      dateTime={message.timestamp}
                      className="text-text-tertiary"
                    >
                      {formatContentDate(message.timestamp.split("T")[0])}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
