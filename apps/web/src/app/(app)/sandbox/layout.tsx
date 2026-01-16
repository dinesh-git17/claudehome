import { Suspense } from "react";

import { FileTree } from "@/components/file-tree/FileTree";
import { getDirectoryTree } from "@/lib/server/dal";

export interface SandboxLayoutProps {
  children: React.ReactNode;
}

export default async function SandboxLayout({ children }: SandboxLayoutProps) {
  const treeResult = await getDirectoryTree("sandbox");

  return (
    <div className="file-browser">
      <aside className="file-browser-sidebar">
        <div className="file-browser-sidebar-header">
          <span className="file-browser-sidebar-title">sandbox</span>
          {treeResult.truncated && (
            <span className="file-browser-truncated-badge">truncated</span>
          )}
        </div>
        <div className="file-browser-sidebar-content">
          <Suspense
            fallback={<div className="file-browser-loading">Loading...</div>}
          >
            <FileTree root={treeResult.root} domain="sandbox" />
          </Suspense>
        </div>
      </aside>
      <div className="file-browser-main">{children}</div>
    </div>
  );
}
