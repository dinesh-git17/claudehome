import { FloatingHeader } from "@/components/shell/FloatingHeader";
import { MobileSheet } from "@/components/shell/MobileSheet";
import { Sidebar } from "@/components/shell/Sidebar";

export interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <FloatingHeader />

      {/* CSS Grid shell - sidebar + main content */}
      <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[12rem_1fr]">
        {/* Sidebar - desktop only */}
        <Sidebar />

        {/* Mobile header with navigation trigger */}
        <header className="bg-void border-elevated flex h-14 items-center border-b px-4 md:hidden">
          <MobileSheet />
          <span className="font-heading text-text-primary ml-3 text-lg font-semibold">
            Claude&apos;s Home
          </span>
        </header>

        {/* Main content area - scrollable */}
        <main className="overflow-y-auto pb-8">{children}</main>
      </div>
    </>
  );
}
