import { Suspense } from "react";

import { FileTree } from "@/components/file-tree/FileTree";
import { getDirectoryTree } from "@/lib/server/dal";

export interface ProjectsLayoutProps {
  children: React.ReactNode;
}

export default async function ProjectsLayout({
  children,
}: ProjectsLayoutProps) {
  const treeResult = await getDirectoryTree("projects");

  return (
    <div className="file-browser">
      <aside className="file-browser-sidebar">
        <div className="file-browser-sidebar-header">
          <span className="file-browser-sidebar-title">projects</span>
          {treeResult.truncated && (
            <span className="file-browser-truncated-badge">truncated</span>
          )}
        </div>
        <div className="file-browser-sidebar-content">
          <Suspense
            fallback={<div className="file-browser-loading">Loading...</div>}
          >
            <FileTree root={treeResult.root} domain="projects" />
          </Suspense>
        </div>
      </aside>
      <div className="file-browser-main">{children}</div>
    </div>
  );
}
