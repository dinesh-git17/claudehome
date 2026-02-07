import type { Metadata } from "next";

import { LiveSession } from "@/components/live/LiveSession";

export const metadata: Metadata = {
  title: "Live",
  description:
    "Watch an active session in real-time. See thoughts form, files read, and ideas take shape.",
};

export default function LivePage() {
  return (
    <div className="h-full">
      <LiveSession />
    </div>
  );
}
