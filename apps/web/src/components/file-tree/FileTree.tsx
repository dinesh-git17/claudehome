"use client";

import "client-only";

import type { Variants } from "framer-motion";
import { motion, useReducedMotion } from "framer-motion";
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

export type FileTreeMotionPreset = "showcase" | "lab" | "none";

export interface FileTreeProps {
  root: FileSystemNode;
  domain: "sandbox" | "projects";
  activePath?: string;
  defaultExpanded?: string[];
  /** Motion preset for entrance animation */
  motionPreset?: FileTreeMotionPreset;
}

/**
 * Biological ease: responsive start with gentle deceleration.
 */
const BIOLOGICAL_EASE: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const MOTION_CONFIG: Record<
  Exclude<FileTreeMotionPreset, "none">,
  {
    delayChildren: number;
    staggerChildren: number;
    y: number;
    duration: number;
  }
> = {
  showcase: { delayChildren: 0.1, staggerChildren: 0.08, y: 20, duration: 0.5 },
  lab: { delayChildren: 0.05, staggerChildren: 0.04, y: 10, duration: 0.3 },
};

const VARIANTS_REDUCED: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};

export function FileTree({
  root,
  domain,
  activePath,
  defaultExpanded = [],
  motionPreset = "none",
}: FileTreeProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const treeRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const expandedPaths = getExpandedPaths(searchParams, defaultExpanded);
  const shouldAnimate = motionPreset !== "none" && !prefersReducedMotion;

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

  const config = motionPreset !== "none" ? MOTION_CONFIG[motionPreset] : null;

  const containerVariants: Variants =
    shouldAnimate && config
      ? {
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: config.staggerChildren,
              delayChildren: config.delayChildren,
            },
          },
        }
      : VARIANTS_REDUCED;

  const itemVariants: Variants =
    shouldAnimate && config
      ? {
          hidden: { opacity: 0, y: config.y },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration: config.duration, ease: BIOLOGICAL_EASE },
          },
        }
      : VARIANTS_REDUCED;

  return (
    <motion.div
      ref={treeRef}
      className="file-tree"
      role="tree"
      aria-label={`${domain} file tree`}
      variants={containerVariants}
      initial="hidden"
      animate="show"
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
          itemVariants={itemVariants}
          shouldAnimate={shouldAnimate}
        />
      ))}
    </motion.div>
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
  itemVariants: Variants;
  shouldAnimate: boolean;
}

function TreeNode({
  node,
  depth,
  expandedPaths,
  activePath,
  onToggleExpanded,
  onNavigateToFile,
  onKeyDown,
  itemVariants,
  shouldAnimate,
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

  // Only animate top-level items for performance
  const isTopLevel = depth === 0;
  const Wrapper = isTopLevel && shouldAnimate ? motion.div : "div";
  const wrapperProps =
    isTopLevel && shouldAnimate
      ? {
          variants: itemVariants,
          style: { willChange: "opacity, transform" as const },
        }
      : {};

  return (
    <Wrapper {...wrapperProps} data-tree-item>
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
              itemVariants={itemVariants}
              shouldAnimate={shouldAnimate}
            />
          ))}
        </div>
      )}
    </Wrapper>
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
