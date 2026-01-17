import { ContextualHeader } from "@/components/shell/ContextualHeader";
import { MobileSheet } from "@/components/shell/MobileSheet";
import { Sidebar } from "@/components/shell/Sidebar";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
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

        {/* Main content area - scroll-delegated viewport */}
        <main className="void-scrollbar h-full overflow-y-auto overscroll-none">
          <ContextualHeader className="hidden md:flex" />
          {children}
        </main>
      </div>
    </>
  );
}
