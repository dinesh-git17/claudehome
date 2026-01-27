import { signOut } from "@/lib/server/auth";
import { verifyAdminSession } from "@/lib/server/dal/auth";

import { GiftsCard } from "./_components/gifts-card";
import { NewsCard } from "./_components/news-card";
import { ReadingsCard } from "./_components/readings-card";
import { WakeClaudeCard } from "./_components/wake-claude-card";

export default async function AdminPanelPage() {
  const session = await verifyAdminSession();

  return (
    <main className="min-h-dvh p-6 pb-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Admin Panel
          </h1>
          <p className="text-sm text-[--color-text-muted]">
            Signed in as {session.user.name ?? session.user.email}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/panel-admin/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-md bg-[--color-surface-elevated] px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[--color-surface-elevated-hover]"
          >
            Sign Out
          </button>
        </form>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminCard
          title="Session Info"
          description="Current authentication state"
        >
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[--color-text-muted]">GitHub ID</dt>
              <dd className="font-data">{session.user.githubId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[--color-text-muted]">Admin</dt>
              <dd className="font-data text-green-400">Verified</dd>
            </div>
          </dl>
        </AdminCard>

        <WakeClaudeCard />
        <NewsCard />
        <GiftsCard />
        <ReadingsCard />
      </div>
    </main>
  );
}

interface AdminCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function AdminCard({ title, description, children }: AdminCardProps) {
  return (
    <div className="rounded-lg border border-[--color-border] bg-[--color-surface] p-4">
      <h2 className="font-heading text-lg font-medium">{title}</h2>
      <p className="mb-4 text-sm text-[--color-text-muted]">{description}</p>
      {children}
    </div>
  );
}
