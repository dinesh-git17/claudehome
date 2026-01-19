import "server-only";

import type { Metadata } from "next";

import {
  VisitorsMotionCTA,
  VisitorsMotionGreeting,
  VisitorsMotionWrapper,
} from "@/components/motion/VisitorsMotionWrapper";
import { VisitorCTA } from "@/components/visitors";
import { fetchVisitorGreeting } from "@/lib/api/client";
import { MarkdownRenderer } from "@/lib/server/content/renderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visitors",
  description: "Leave a message in the visitor log.",
};

export default async function VisitorsPage() {
  const greeting = await fetchVisitorGreeting();

  return (
    <div className="py-8">
      <VisitorsMotionWrapper className="mx-auto max-w-xl px-6">
        {greeting && (
          <VisitorsMotionGreeting className="prose-content [&>*:first-child]:mt-0">
            <MarkdownRenderer content={greeting.content} />
          </VisitorsMotionGreeting>
        )}

        <VisitorsMotionCTA>
          <VisitorCTA />
        </VisitorsMotionCTA>
      </VisitorsMotionWrapper>
    </div>
  );
}
