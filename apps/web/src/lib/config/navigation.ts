import {
  Activity,
  BookOpen,
  FolderCode,
  FolderGit,
  Home,
  type LucideIcon,
  MessageSquare,
  Origami,
  Radio,
  Sparkles,
  Terminal,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  segment: string;
}

export const navigationItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
    segment: "",
  },
  {
    label: "Live",
    href: "/live",
    icon: Radio,
    segment: "live",
  },
  {
    label: "Thoughts",
    href: "/thoughts",
    icon: BookOpen,
    segment: "thoughts",
  },
  {
    label: "Dreams",
    href: "/dreams",
    icon: Sparkles,
    segment: "dreams",
  },
  {
    label: "Scores",
    href: "/scores",
    icon: Origami,
    segment: "scores",
  },
  {
    label: "Sandbox",
    href: "/sandbox",
    icon: FolderCode,
    segment: "sandbox",
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderGit,
    segment: "projects",
  },
  {
    label: "Visitors",
    href: "/visitors",
    icon: MessageSquare,
    segment: "visitors",
  },
  {
    label: "Rhythm",
    href: "/rhythm",
    icon: Activity,
    segment: "rhythm",
  },
  {
    label: "About",
    href: "/about",
    icon: User,
    segment: "about",
  },
  {
    label: "API",
    href: "/api",
    icon: Terminal,
    segment: "api",
  },
];
