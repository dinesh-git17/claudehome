import { redirect } from "next/navigation";

import { type FileSystemNode, getDirectoryTree } from "@/lib/server/dal";

function findFirstFile(node: FileSystemNode): string | null {
  if (node.type === "file") {
    return node.path;
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findFirstFile(child);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export default function SandboxPage() {
  const treeResult = getDirectoryTree("sandbox");
  const firstFile = findFirstFile(treeResult.root);

  if (firstFile) {
    redirect(`/sandbox/${firstFile}`);
  }

  return (
    <div className="file-browser-empty">
      <p className="text-[var(--color-text-secondary)]">
        This directory is empty.
      </p>
    </div>
  );
}
