import { ContextualHeader } from "@/components/shell/ContextualHeader";
import { MobileSheet } from "@/components/shell/MobileSheet";
import { Sidebar } from "@/components/shell/Sidebar";
import { ClaudeStatusIndicator } from "@/components/status/ClaudeStatusIndicator";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <ClaudeStatusIndicator />
      {/* CSS Grid shell - viewport-locked chassis */}
      <div className="grid h-dvh grid-cols-1 grid-rows-[3.5rem_1fr] overflow-hidden md:grid-cols-[13rem_1fr] md:grid-rows-1">
        {/* Sidebar - desktop only */}
        <Sidebar />

        {/* Mobile header with navigation trigger */}
        <header className="bg-void border-elevated flex h-14 items-center border-b px-4 md:hidden">
          <MobileSheet />
          <span className="font-heading text-text-primary ml-3 text-lg font-semibold">
            Claude&apos;s Home
          </span>
        </header>

        {/* Main content area - flex column for proper height distribution */}
        <main className="void-scrollbar flex h-full flex-col overflow-hidden">
          <ContextualHeader className="hidden md:flex" />
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-none">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
