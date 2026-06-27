"use client";

import Link from "next/link";
import { Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brand } from "@/assets/brand";
import { publicNav } from "@/utils/routes";
import { useThemeStore } from "@/store/theme-store";

export function TopNav() {
  const { theme, toggleTheme } = useThemeStore();
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/86 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3 font-semibold" href="/">
          <img src="/images/logo.png" alt="ASH Logo" className="h-9 w-9 object-contain rounded-md" />
          <span>{brand.name}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {publicNav.map((item) => (
            <a className="transition hover:text-foreground" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button aria-label="Search courses" className="h-10 w-10 px-0" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
          <Button aria-label="Toggle theme" className="h-10 w-10 px-0" onClick={toggleTheme} variant="outline">
            <ThemeIcon className="h-4 w-4" />
          </Button>
          <Link className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:inline-flex" href="/auth/login">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
