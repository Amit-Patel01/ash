"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { RoleDashboard } from "@/components/dashboard/role-dashboard";
import { RoleSidebar } from "@/components/sidebar/role-sidebar";
import { roleNavItems } from "@/utils/routes";
import { brand } from "@/assets/brand";
import type { Role } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";

const titles: Record<Role, string> = {
  student: "Student Dashboard",
  mentor: "Mentor Dashboard",
  admin: "Admin Dashboard",
  hr: "HR Dashboard"
};

export function DashboardPage({ role }: { role: Role }) {
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
    <div className="flex flex-col min-h-screen bg-background lg:flex-row">
      {/* Mobile Top Bar */}
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden shrink-0">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="ASH Logo" className="h-8 w-8 object-contain rounded-md" />
          <span className="font-semibold text-xs tracking-tight">{brand.product}</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            onChange={(e) => router.push(e.target.value)}
            defaultValue={`/${role}/dashboard`}
            className="text-xs bg-muted border border-border rounded px-2.5 py-1.5 focus:outline-none max-w-[120px] font-semibold text-slate-700 dark:text-slate-200"
          >
            {roleNavItems[role].map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleLogout}
            className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <RoleSidebar role={role} />

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{role} workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">{titles[role]}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Role-specific metrics, live activity, reports, and operational health for Amit Solution Hub LMS.
            </p>
          </div>
          <RoleDashboard role={role} />
        </div>
      </main>
    </div>
  );
}
