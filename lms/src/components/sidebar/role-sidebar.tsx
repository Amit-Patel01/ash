"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { roleNavItems } from "@/utils/routes";
import type { Role } from "@/types";
import { brand } from "@/assets/brand";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";

export function RoleSidebar({ role }: { role: Role }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    }
    logout();
    router.push("/auth/login");
  };

  return (
    <aside className="hidden min-h-screen w-72 border-r border-border bg-card px-4 py-5 lg:flex flex-col justify-between shrink-0">
      <div>
        <Link className="mb-8 flex items-center gap-3 font-semibold" href="/">
          <img src="/images/logo.png" alt="ASH Logo" className="h-9 w-9 object-contain rounded-md" />
          <span>{brand.product}</span>
        </Link>
        <nav className="space-y-1">
          {roleNavItems[role].map((item) => (
            <Link
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-rose-600 dark:text-rose-400 transition hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
