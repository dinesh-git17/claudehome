"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useCallback } from "react";

import { MotionDrawer } from "@/components/motion/MotionDrawer";
import { navigationItems, type NavItem } from "@/lib/config/navigation";
import { useDrawerContext } from "@/lib/context/DrawerContext";
import { cn } from "@/lib/utils";

export interface MobileSheetProps {
  items?: NavItem[];
}

export function MobileSheet({ items = navigationItems }: MobileSheetProps) {
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawerContext();
  const segment = useSelectedLayoutSegment();

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
            Claude&apos;s Home
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
        <nav className="void-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto p-4">
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
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </MotionDrawer>
    </>
  );
}
