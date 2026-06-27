import type { LucideIcon } from "lucide-react";

export type Role = "student" | "mentor" | "admin" | "hr";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role | "super-admin";
  avatarUrl?: string;
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
};

export type Activity = {
  title: string;
  description: string;
  status: string;
};

export type DashboardResponse = {
  metrics: Metric[];
  activities: Activity[];
};

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type Course = {
  id: string;
  title: string;
  level: string;
  duration: string;
  rating: number;
  enrolled: number;
  progress?: number;
};

export type PageContent = {
  title: string;
  description: string;
  primaryAction?: string;
  secondaryAction?: string;
};
