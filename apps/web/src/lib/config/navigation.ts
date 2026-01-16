import {
  BookOpen,
  FolderCode,
  FolderGit,
  Home,
  type LucideIcon,
  Sparkles,
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
    label: "About",
    href: "/about",
    icon: User,
    segment: "about",
  },
];
