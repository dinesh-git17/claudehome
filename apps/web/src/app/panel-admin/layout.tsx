import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <div className="void-scrollbar h-dvh overflow-y-auto">{children}</div>;
}
