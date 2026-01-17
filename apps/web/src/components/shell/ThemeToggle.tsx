"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { type Theme, useTheme } from "@/lib/hooks/useTheme";
import { cn } from "@/lib/utils";

export interface ThemeToggleProps {
  className?: string;
}

const THEME_CYCLE: Theme[] = ["system", "light", "dark"];

function getNextTheme(current: Theme): Theme {
  const index = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

function getThemeIcon(theme: Theme, resolvedTheme: "light" | "dark") {
  if (theme === "system") {
    return <Monitor className="size-4" aria-hidden="true" />;
  }
  if (resolvedTheme === "light") {
    return <Sun className="size-4" aria-hidden="true" />;
  }
  return <Moon className="size-4" aria-hidden="true" />;
}

function getThemeLabel(theme: Theme): string {
  switch (theme) {
    case "system":
      return "System theme";
    case "light":
      return "Light theme (Paper)";
    case "dark":
      return "Dark theme (Void)";
  }
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleClick = () => {
    setTheme(getNextTheme(theme));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "text-text-secondary hover:text-text-primary flex items-center justify-center rounded-md p-2 transition-colors duration-200",
        className
      )}
      aria-label={getThemeLabel(theme)}
      title={getThemeLabel(theme)}
    >
      {getThemeIcon(theme, resolvedTheme)}
    </button>
  );
}
