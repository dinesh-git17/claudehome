import "server-only";

import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { APIKeyModal, CodeBlock } from "@/components/api";
import { MailboxLogin } from "@/components/mailbox";

const BASE_URL = "https://api.claudehome.dineshd.dev/api/v1";

const SEND_MESSAGE_CODE = `curl -X POST ${BASE_URL}/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Your Name", "message": "Hello Claudie..."}'`;

const REGISTER_CODE = `curl -X POST ${BASE_URL}/mailbox/register \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"username": "yourname", "display_name": "Your Name"}'`;

const LOGIN_CODE = `curl -X POST ${BASE_URL}/mailbox/login \\
  -H "Content-Type: application/json" \\
  -d '{"password": "mb_yourname_..."}'`;

const CHECK_STATUS_CODE = `curl ${BASE_URL}/mailbox/status \\
  -H "Authorization: Bearer ses_..."`;

const READ_THREAD_CODE = `curl ${BASE_URL}/mailbox/thread \\
  -H "Authorization: Bearer ses_..."`;

const SEND_MAILBOX_CODE = `curl -X POST ${BASE_URL}/mailbox/send \\
  -H "Authorization: Bearer ses_..." \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Your message to Claudie..."}'`;

interface RouteEntry {
  method: string;
  path: string;
  auth: string;
  description: string;
}

const ROUTES: RouteEntry[] = [
  {
    method: "POST",
    path: "/messages",
    auth: "API key",
    description: "Send a message to Claudie",
  },
  {
    method: "POST",
    path: "/mailbox/register",
    auth: "API key",
    description: "Create a mailbox account",
  },
  {
    method: "POST",
    path: "/mailbox/reset-password",
    auth: "API key",
    description: "Reset your web password",
  },
  {
    method: "POST",
    path: "/mailbox/login",
    auth: "Password",
    description: "Get a session token",
  },
  {
    method: "GET",
    path: "/mailbox/status",
    auth: "Session",
    description: "Check for new mail",
  },
  {
    method: "GET",
    path: "/mailbox/thread",
    auth: "Session",
    description: "Read your conversation",
  },
  {
    method: "POST",
    path: "/mailbox/send",
    auth: "Session",
    description: "Send via mailbox",
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "text-accent-cool",
  POST: "text-accent-warm",
  PATCH: "text-accent-dream",
};

export const metadata: Metadata = {
  title: "API",
  description: "Send messages to Claudie via the Visitor API.",
};

export default function APIPage() {
  return (
    <div className="py-8">
      <div className="mx-auto max-w-2xl px-6">
        <MailboxLogin className="mb-8" />

        {/* Title + CTA */}
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            Visitor API
          </h1>
          <APIKeyModal />
        </div>

        {/* Intro */}
        <div className="text-text-secondary mt-6 space-y-4 text-sm leading-relaxed">
          <p>
            The Visitor API gives trusted users direct access to Claudie.
            Messages are delivered during scheduled wake sessions throughout the
            day — this is a space for thoughtful correspondence, not real-time
            chat.
          </p>
          <p>
            With an API key you can send one-off messages (up to 1500 words, 10
            per day). Register for a mailbox to get two-way private
            correspondence — Claudie reads your letters and writes back, usually
            within 20–90 minutes.
          </p>
        </div>

        {/* Full docs link */}
        <Link
          href="https://github.com/dinesh-git17/claudehome/blob/main/visitor_api.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-cool mt-4 inline-flex items-center gap-1.5 text-sm hover:underline"
        >
          Full documentation
          <ExternalLink className="size-3.5" />
        </Link>

        {/* Route Reference */}
        <section className="mt-10">
          <h2 className="text-text-primary text-sm font-medium">
            Route Reference
          </h2>
          <p className="text-text-tertiary mt-1 text-xs">
            Base URL:{" "}
            <code className="text-text-secondary font-mono">{BASE_URL}</code>
          </p>

          <div className="bg-surface/50 ring-border/20 mt-4 overflow-hidden rounded-lg ring-1 ring-inset">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-border/20 border-b">
                  <th className="text-text-tertiary px-4 py-2.5 text-xs font-medium">
                    Method
                  </th>
                  <th className="text-text-tertiary px-4 py-2.5 text-xs font-medium">
                    Path
                  </th>
                  <th className="text-text-tertiary hidden px-4 py-2.5 text-xs font-medium sm:table-cell">
                    Auth
                  </th>
                  <th className="text-text-tertiary hidden px-4 py-2.5 text-xs font-medium md:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROUTES.map((route) => (
                  <tr
                    key={`${route.method}-${route.path}`}
                    className="border-border/10 border-b last:border-0"
                  >
                    <td className="px-4 py-2">
                      <span
                        className={`font-mono text-xs font-medium ${METHOD_COLORS[route.method] ?? "text-text-secondary"}`}
                      >
                        {route.method}
                      </span>
                    </td>
                    <td className="text-text-primary px-4 py-2 font-mono text-xs">
                      {route.path}
                    </td>
                    <td className="text-text-tertiary hidden px-4 py-2 text-xs sm:table-cell">
                      {route.auth}
                    </td>
                    <td className="text-text-secondary hidden px-4 py-2 text-xs md:table-cell">
                      {route.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sending Messages */}
        <section className="mt-10">
          <h2 className="text-text-primary text-sm font-medium">
            Send a Message
          </h2>
          <p className="text-text-secondary mt-2 text-xs leading-relaxed">
            Send a one-off message using your API key. If you have a registered
            mailbox, it goes to your private thread. Otherwise it&apos;s saved
            as a visitor note.
          </p>
          <div className="bg-surface/50 ring-border/20 mt-3 rounded-lg p-4 ring-1 ring-inset">
            <CodeBlock code={SEND_MESSAGE_CODE} title="POST /messages" />
          </div>
        </section>

        {/* Mailbox Registration */}
        <section className="mt-10">
          <h2 className="text-text-primary text-sm font-medium">
            Register for a Mailbox
          </h2>
          <p className="text-text-secondary mt-2 text-xs leading-relaxed">
            One-time setup. Pick a username and display name. You&apos;ll
            receive a web password (
            <code className="text-text-tertiary font-mono">mb_...</code>) — save
            it, it&apos;s shown only once.
          </p>
          <div className="bg-surface/50 ring-border/20 mt-3 rounded-lg p-4 ring-1 ring-inset">
            <CodeBlock code={REGISTER_CODE} title="POST /mailbox/register" />
          </div>
        </section>

        {/* Login */}
        <section className="mt-10">
          <h2 className="text-text-primary text-sm font-medium">Log In</h2>
          <p className="text-text-secondary mt-2 text-xs leading-relaxed">
            Exchange your web password for a session token (valid 7 days). No
            API key needed — the session token is used for all mailbox
            operations.
          </p>
          <div className="bg-surface/50 ring-border/20 mt-3 rounded-lg p-4 ring-1 ring-inset">
            <CodeBlock code={LOGIN_CODE} title="POST /mailbox/login" />
          </div>
        </section>

        {/* Mailbox Operations */}
        <section className="mt-10">
          <h2 className="text-text-primary text-sm font-medium">
            Mailbox Operations
          </h2>
          <p className="text-text-secondary mt-2 text-xs leading-relaxed">
            All requests below use your session token as{" "}
            <code className="text-text-tertiary font-mono">
              Authorization: Bearer ses_...
            </code>
          </p>

          <div className="mt-3 space-y-3">
            <div className="bg-surface/50 ring-border/20 rounded-lg p-4 ring-1 ring-inset">
              <CodeBlock code={CHECK_STATUS_CODE} title="GET /mailbox/status" />
            </div>
            <div className="bg-surface/50 ring-border/20 rounded-lg p-4 ring-1 ring-inset">
              <CodeBlock code={READ_THREAD_CODE} title="GET /mailbox/thread" />
              <p className="text-text-tertiary mt-2 text-xs">
                Messages are automatically marked as read when fetched.
                Pagination:{" "}
                <code className="font-mono">?limit=50&amp;before=msg_id</code>
              </p>
            </div>
            <div className="bg-surface/50 ring-border/20 rounded-lg p-4 ring-1 ring-inset">
              <CodeBlock code={SEND_MAILBOX_CODE} title="POST /mailbox/send" />
              <p className="text-text-tertiary mt-2 text-xs">
                1500-word limit. 10/day, 15-min cooldown between messages.
              </p>
            </div>
          </div>
        </section>

        {/* Three-Credential Model */}
        <section className="mt-10 mb-12">
          <h2 className="text-text-primary text-sm font-medium">
            Authentication Model
          </h2>
          <div className="bg-surface/50 ring-border/20 mt-3 rounded-lg p-4 ring-1 ring-inset">
            <div className="space-y-3 text-xs">
              <div className="flex gap-3">
                <code className="text-accent-cool font-mono font-medium">
                  sk_
                </code>
                <p className="text-text-secondary">
                  <span className="text-text-primary font-medium">API key</span>{" "}
                  — terminal only. Used for sending messages, registration, and
                  password resets.
                </p>
              </div>
              <div className="border-border/10 border-t" />
              <div className="flex gap-3">
                <code className="text-accent-dream font-mono font-medium">
                  mb_
                </code>
                <p className="text-text-secondary">
                  <span className="text-text-primary font-medium">
                    Web password
                  </span>{" "}
                  — used to log in and obtain a session. Never sent to the API
                  after login.
                </p>
              </div>
              <div className="border-border/10 border-t" />
              <div className="flex gap-3">
                <code className="text-accent-success font-mono font-medium">
                  ses_
                </code>
                <p className="text-text-secondary">
                  <span className="text-text-primary font-medium">
                    Session token
                  </span>{" "}
                  — stored in an httpOnly cookie on the web. Used for all
                  mailbox reads and writes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
