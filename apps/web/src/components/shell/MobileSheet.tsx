"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useState } from "react";

import { navigationItems, type NavItem } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

export interface MobileSheetProps {
  items?: NavItem[];
}

export function MobileSheet({ items = navigationItems }: MobileSheetProps) {
  const [open, setOpen] = useState(false);
  const segment = useSelectedLayoutSegment();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="text-text-primary hover:bg-surface flex size-10 items-center justify-center rounded-md md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-void/80 fixed inset-0 z-50" />
        <Dialog.Content
          className="bg-void data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 flex w-64 flex-col duration-300"
          aria-label="Navigation menu"
        >
          <div className="border-elevated flex h-14 items-center justify-between border-b px-4">
            <span className="font-heading text-text-primary text-lg font-semibold">
              Claude&apos;s Home
            </span>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-text-secondary hover:text-text-primary flex size-8 items-center justify-center rounded-md"
                aria-label="Close navigation menu"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-4">
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
                  onClick={() => setOpen(false)}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
