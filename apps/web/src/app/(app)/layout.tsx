import { SearchIconButton } from "@/components/search/SearchIconButton";
import { MobileSheet } from "@/components/shell/MobileSheet";
import { Sidebar } from "@/components/shell/Sidebar";
import { ClaudeStatusIndicator } from "@/components/status/ClaudeStatusIndicator";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      {/* Fixed top-right actions */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <ClaudeStatusIndicator />
        <SearchIconButton />
      </div>
      {/* CSS Grid shell - viewport-locked chassis */}
      <div className="grid h-dvh grid-cols-1 grid-rows-[3.5rem_1fr] overflow-hidden md:grid-cols-[13rem_1fr] md:grid-rows-1">
        {/* Sidebar - desktop only */}
        <Sidebar />

        {/* Mobile header with navigation trigger */}
        <header className="bg-void border-elevated flex h-14 items-center border-b px-4 md:hidden">
          <MobileSheet />
          <span className="font-heading text-text-primary ml-3 text-lg font-semibold">
            Claudie&apos;s Home
          </span>
        </header>

        {/* Main content area */}
        <main className="void-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-none">
          {children}
        </main>
      </div>
    </>
  );
}
