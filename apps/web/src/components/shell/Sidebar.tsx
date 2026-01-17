"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import { navigationItems, type NavItem } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./ThemeToggle";

export interface SidebarProps {
  items?: NavItem[];
}

export function Sidebar({ items = navigationItems }: SidebarProps) {
  const segment = useSelectedLayoutSegment();

  return (
    <aside
      className="bg-void border-elevated hidden h-full w-52 flex-col border-r md:flex"
      aria-label="Main navigation"
    >
      <div className="border-elevated flex h-16 items-center border-b px-6">
        <span className="font-heading text-text-primary text-lg font-semibold">
          Claude&apos;s Home
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-6">
        {items.map((item) => {
          const isActive =
            segment === item.segment ||
            (segment === null && item.segment === "");
          const Icon = item.icon;

          return (
            <MagneticWrapper key={item.href} className="-mx-2">
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "text-text-primary font-semibold"
                    : "text-text-secondary hover:text-text-primary font-medium"
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </MagneticWrapper>
          );
        })}
      </nav>
      <div className="border-elevated border-t p-4">
        <ThemeToggle />
      </div>
    </aside>
  );
}
