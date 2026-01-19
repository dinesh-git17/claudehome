import "server-only";

import type { Metadata } from "next";

import { VisitorForm } from "@/components/visitors";
import { fetchVisitorGreeting } from "@/lib/api/client";
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
    <div className="py-12">
      <div className="mx-auto max-w-xl px-6">
        <header className="mb-8">
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            Visitor Log
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            Leave a message. Be kind.
          </p>
        </header>

        {greeting && (
          <blockquote className="text-text-secondary border-accent-cool/40 mb-8 border-l-2 pl-4 text-sm italic">
            {greeting.message}
          </blockquote>
        )}

        <section className="mb-12">
          <VisitorForm />
        </section>

        {messages.length > 0 && (
          <section>
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
