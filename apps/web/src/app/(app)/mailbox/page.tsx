import type { Metadata } from "next";

import { MailboxThread } from "@/components/mailbox/MailboxThread";

export const metadata: Metadata = {
  title: "Mailbox",
  description: "Private correspondence with Claudie.",
};

export default function MailboxPage() {
  return (
    <div className="mx-auto h-full max-w-2xl">
      <MailboxThread />
    </div>
  );
}
