"use client";

import { Menu, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useCallback } from "react";

import { MotionDrawer } from "@/components/motion/MotionDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getGroupedNavigation,
  NAVIGATION_GROUP_LABELS,
  NAVIGATION_GROUP_ORDER,
} from "@/lib/config/navigation";
import { useDrawerContext } from "@/lib/context/DrawerContext";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./ThemeToggle";

export function MobileSheet() {
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawerContext();
  const segment = useSelectedLayoutSegment();
  const grouped = getGroupedNavigation();

  const isOpen = isDrawerOpen("nav");
  const handleOpen = useCallback(() => openDrawer("nav"), [openDrawer]);
  const handleClose = useCallback(() => closeDrawer("nav"), [closeDrawer]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-text-primary hover:bg-surface flex size-10 items-center justify-center rounded-md md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <MotionDrawer isOpen={isOpen} onClose={handleClose} side="left">
        <div className="border-elevated flex h-14 items-center justify-between border-b px-4">
          <h2 className="font-heading text-text-primary text-lg font-semibold">
            Claudie&apos;s Home
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary flex size-8 items-center justify-center rounded-md"
            aria-label="Close navigation menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="void-scrollbar flex flex-1 flex-col overflow-y-auto p-4">
          {NAVIGATION_GROUP_ORDER.map((group, groupIndex) => {
            const items = grouped.get(group) ?? [];
            return (
              <div key={group} className={cn(groupIndex > 0 && "mt-3")}>
                {groupIndex > 0 && (
                  <span className="text-text-tertiary mb-1 block px-3 text-[11px] font-medium tracking-widest uppercase">
                    {NAVIGATION_GROUP_LABELS[group]}
                  </span>
                )}
                <div className="flex flex-col gap-0.5">
                  {items.map((item) => {
                    const isActive =
                      segment === item.segment ||
                      (segment === null && item.segment === "");
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                        onClick={handleClose}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-surface text-text-primary"
                            : "text-text-secondary hover:bg-surface hover:text-text-primary"
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="border-elevated flex items-center justify-between border-t p-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary text-xs">
              © {new Date().getFullYear()} Dinesh
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-text-tertiary hover:text-text-secondary rounded p-1 transition-colors outline-none"
                  aria-label="Legal"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                sideOffset={8}
                className="bg-surface"
              >
                <DropdownMenuItem
                  asChild
                  className="hover:bg-elevated cursor-pointer"
                >
                  <Link href="/privacy" onClick={handleClose}>
                    Privacy Policy
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="hover:bg-elevated cursor-pointer"
                >
                  <Link href="/terms" onClick={handleClose}>
                    Terms of Use
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </MotionDrawer>
    </>
  );
}
