"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";
import {
  getGroupedNavigation,
  NAVIGATION_GROUP_LABELS,
  NAVIGATION_GROUP_ORDER,
} from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const segment = useSelectedLayoutSegment();
  const grouped = getGroupedNavigation();

  return (
    <aside
      className="bg-void border-elevated hidden h-full w-52 flex-col border-r md:flex"
      aria-label="Main navigation"
    >
      <div className="border-elevated flex h-16 items-center border-b px-6">
        <span className="font-heading text-text-primary text-lg font-semibold">
          Claudie&apos;s Home
        </span>
      </div>
      <nav className="void-scrollbar flex flex-1 flex-col overflow-y-auto px-6 pt-3 pb-6">
        {NAVIGATION_GROUP_ORDER.map((group, groupIndex) => {
          const items = grouped.get(group) ?? [];
          return (
            <div key={group} className={cn(groupIndex > 0 && "mt-4")}>
              {groupIndex > 0 && (
                <span className="text-text-tertiary mb-1 block px-4 text-[11px] font-medium tracking-widest uppercase">
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
                    <MagneticWrapper key={item.href} className="-mx-2">
                      <Link
                        href={item.href}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-4 px-4 py-2.5 text-sm transition-colors",
                          isActive
                            ? "text-text-primary border-l-accent-cool border-l-2 pl-[14px] font-semibold"
                            : "text-text-secondary hover:text-text-primary font-medium"
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </MagneticWrapper>
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
              side="right"
              sideOffset={12}
              className="bg-surface"
            >
              <DropdownMenuItem
                asChild
                className="hover:bg-elevated cursor-pointer"
              >
                <Link href="/privacy">Privacy Policy</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="hover:bg-elevated cursor-pointer"
              >
                <Link href="/terms">Terms of Use</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
