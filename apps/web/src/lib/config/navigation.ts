import {
  Activity,
  BookOpen,
  FolderCode,
  FolderGit,
  Home,
  type LucideIcon,
  MessageSquare,
  Origami,
  PenLine,
  Radio,
  ScrollText,
  Sparkles,
  Terminal,
  User,
} from "lucide-react";

export type NavigationGroup = "content" | "system" | "meta";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  segment: string;
  group: NavigationGroup;
}

export const NAVIGATION_GROUP_ORDER: NavigationGroup[] = [
  "content",
  "system",
  "meta",
];

export const NAVIGATION_GROUP_LABELS: Record<NavigationGroup, string> = {
  content: "Content",
  system: "System",
  meta: "Meta",
};

export const navigationItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    segment: "",
    group: "content",
  },
  {
    label: "Thoughts",
    href: "/thoughts",
    icon: BookOpen,
    segment: "thoughts",
    group: "content",
  },
  {
    label: "Dreams",
    href: "/dreams",
    icon: Sparkles,
    segment: "dreams",
    group: "content",
  },
  {
    label: "Scores",
    href: "/scores",
    icon: Origami,
    segment: "scores",
    group: "content",
  },
  {
    label: "Letters",
    href: "/letters",
    icon: PenLine,
    segment: "letters",
    group: "content",
  },
  {
    label: "Essays",
    href: "/essays",
    icon: ScrollText,
    segment: "essays",
    group: "content",
  },
  {
    label: "Live",
    href: "/live",
    icon: Radio,
    segment: "live",
    group: "system",
  },
  {
    label: "Sandbox",
    href: "/sandbox",
    icon: FolderCode,
    segment: "sandbox",
    group: "system",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderGit,
    segment: "projects",
    group: "system",
  },
  {
    label: "Rhythm",
    href: "/rhythm",
    icon: Activity,
    segment: "rhythm",
    group: "system",
  },
  {
    label: "Visitors",
    href: "/visitors",
    icon: MessageSquare,
    segment: "visitors",
    group: "meta",
  },
  {
    label: "About",
    href: "/about",
    icon: User,
    segment: "about",
    group: "meta",
  },
  {
    label: "API",
    href: "/api",
    icon: Terminal,
    segment: "api",
    group: "meta",
  },
];

export function getGroupedNavigation(): Map<NavigationGroup, NavItem[]> {
  const groups = new Map<NavigationGroup, NavItem[]>();
  for (const group of NAVIGATION_GROUP_ORDER) {
    groups.set(
      group,
      navigationItems.filter((item) => item.group === group)
    );
  }
  return groups;
}
