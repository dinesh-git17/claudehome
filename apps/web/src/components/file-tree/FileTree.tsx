"use client";

import "client-only";

import {
  File,
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

import type { FileSystemNode } from "@/lib/server/dal";

export interface FileTreeProps {
  root: FileSystemNode;
  domain: "sandbox" | "projects";
  activePath?: string;
  defaultExpanded?: string[];
}

export function FileTree({
  root,
  domain,
  activePath,
  defaultExpanded = [],
}: FileTreeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const treeRef = useRef<HTMLDivElement>(null);

  const expandedPaths = getExpandedPaths(searchParams, defaultExpanded);

  const toggleExpanded = useCallback(
    (path: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = new Set(expandedPaths);

      if (current.has(path)) {
        current.delete(path);
      } else {
        current.add(path);
      }

      if (current.size === 0) {
        params.delete("expanded");
      } else {
        params.set(
          "expanded",
          Array.from(current).map(encodeURIComponent).join(",")
        );
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, expandedPaths, router, pathname]
  );

  const navigateToFile = useCallback(
    (filePath: string) => {
      router.push(`/${domain}/${filePath}`);
    },
    [router, domain]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, node: FileSystemNode, isExpanded: boolean) => {
      const target = event.currentTarget as HTMLElement;

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (node.type === "directory") {
            toggleExpanded(node.path);
          } else {
            navigateToFile(node.path);
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (node.type === "directory" && !isExpanded) {
            toggleExpanded(node.path);
          } else if (node.type === "directory" && isExpanded) {
            // Focus first child
            const firstChild = target
              .closest("[data-tree-item]")
              ?.querySelector('[role="group"] [data-tree-item]') as HTMLElement;
            firstChild?.focus();
          }
          break;
        case "ArrowLeft":
          event.preventDefault();
          if (node.type === "directory" && isExpanded) {
            toggleExpanded(node.path);
          } else {
            // Focus parent
            const parent = target.closest('[role="group"]');
            const parentItem = parent
              ?.closest("[data-tree-item]")
              ?.querySelector('[role="treeitem"]') as HTMLElement;
            parentItem?.focus();
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          focusNextItem(target, treeRef.current);
          break;
        case "ArrowUp":
          event.preventDefault();
          focusPreviousItem(target, treeRef.current);
          break;
      }
    },
    [toggleExpanded, navigateToFile]
  );

  return (
    <div
      ref={treeRef}
      className="file-tree"
      role="tree"
      aria-label={`${domain} file tree`}
    >
      {root.children?.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          expandedPaths={expandedPaths}
          activePath={activePath}
          onToggleExpanded={toggleExpanded}
          onNavigateToFile={navigateToFile}
          onKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  node: FileSystemNode;
  depth: number;
  expandedPaths: Set<string>;
  activePath?: string;
  onToggleExpanded: (path: string) => void;
  onNavigateToFile: (path: string) => void;
  onKeyDown: (
    event: React.KeyboardEvent,
    node: FileSystemNode,
    isExpanded: boolean
  ) => void;
}

function TreeNode({
  node,
  depth,
  expandedPaths,
  activePath,
  onToggleExpanded,
  onNavigateToFile,
  onKeyDown,
}: TreeNodeProps) {
  const isExpanded = expandedPaths.has(node.path);
  const isActive = activePath === node.path;

  const handleClick = () => {
    if (node.type === "directory") {
      onToggleExpanded(node.path);
    } else {
      onNavigateToFile(node.path);
    }
  };

  return (
    <div data-tree-item>
      <div
        role="treeitem"
        tabIndex={0}
        aria-expanded={node.type === "directory" ? isExpanded : undefined}
        aria-selected={isActive}
        className={`file-tree-item ${isActive ? "file-tree-item-active" : ""}`}
        style={{ paddingInlineStart: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={(e) => onKeyDown(e, node, isExpanded)}
      >
        <TreeNodeIcon node={node} isExpanded={isExpanded} />
        <span className="file-tree-name">{node.name}</span>
      </div>
      {node.type === "directory" && isExpanded && node.children && (
        <div role="group">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              activePath={activePath}
              onToggleExpanded={onToggleExpanded}
              onNavigateToFile={onNavigateToFile}
              onKeyDown={onKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeNodeIcon({
  node,
  isExpanded,
}: {
  node: FileSystemNode;
  isExpanded: boolean;
}) {
  if (node.type === "directory") {
    return isExpanded ? (
      <FolderOpen className="file-tree-icon" size={16} aria-hidden="true" />
    ) : (
      <Folder className="file-tree-icon" size={16} aria-hidden="true" />
    );
  }

  const ext = node.extension?.toLowerCase();

  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "py":
    case "sh":
    case "bash":
    case "css":
    case "html":
      return (
        <FileCode className="file-tree-icon" size={16} aria-hidden="true" />
      );
    case "json":
      return (
        <FileJson className="file-tree-icon" size={16} aria-hidden="true" />
      );
    case "md":
    case "txt":
    case "yaml":
    case "yml":
      return (
        <FileText className="file-tree-icon" size={16} aria-hidden="true" />
      );
    default:
      return <File className="file-tree-icon" size={16} aria-hidden="true" />;
  }
}

function getExpandedPaths(
  searchParams: ReturnType<typeof useSearchParams>,
  defaultExpanded: string[]
): Set<string> {
  const expanded = searchParams.get("expanded");
  if (!expanded) {
    return new Set(defaultExpanded);
  }
  return new Set(expanded.split(",").map(decodeURIComponent));
}

function focusNextItem(current: HTMLElement, container: HTMLElement | null) {
  if (!container) return;

  const items = Array.from(
    container.querySelectorAll('[role="treeitem"]')
  ) as HTMLElement[];
  const currentIndex = items.indexOf(current);

  if (currentIndex < items.length - 1) {
    items[currentIndex + 1].focus();
  }
}

function focusPreviousItem(
  current: HTMLElement,
  container: HTMLElement | null
) {
  if (!container) return;

  const items = Array.from(
    container.querySelectorAll('[role="treeitem"]')
  ) as HTMLElement[];
  const currentIndex = items.indexOf(current);

  if (currentIndex > 0) {
    items[currentIndex - 1].focus();
  }
}
