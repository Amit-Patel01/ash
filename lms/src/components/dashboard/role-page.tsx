"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RoleSidebar } from "@/components/sidebar/role-sidebar";
import { pageContent, roleNavItems } from "@/utils/routes";
import { brand } from "@/assets/brand";
import type { Role } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";

// Import custom fully working views
import { StudentCourses } from "./student-courses";
import { StudentQuizzes } from "./student-quizzes";
import { StudentProfile } from "./student-profile";
import { StudentAssignments } from "./student-assignments";
import { StudentTasks } from "./student-tasks";
import { StudentMessages } from "./student-messages";
import { StudentCertificates } from "./student-certificates";
import { AdminStudents } from "./admin-students";
import { AdminCourses } from "./admin-courses";
import { AdminPayments } from "./admin-payments";
import { HrDashboardViews } from "./hr-dashboard-views";
import { AiFeaturesView } from "./ai-features-view";
import { ProgramDashboard } from "./program-dashboard";
import { AdminMentors } from "./admin-mentors";
import { AdminHr } from "./admin-hr";

export function RolePage({ role, pageKey }: { role: Role; pageKey: string }) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const content = pageContent[pageKey] || { title: "Workspace", description: "Operational workspace for Amit Solution Hub LMS." };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // ignore
    }
    logout();
    router.push("/auth/login");
  };

  const renderView = () => {
    // Student Workspace routing
    if (pageKey === "student/courses") return <StudentCourses />;
    if (pageKey === "student/quizzes" || pageKey === "student/results") return <StudentQuizzes />;
    if (pageKey === "student/profile" || pageKey === "student/settings") return <StudentProfile />;
    if (pageKey === "student/assignments") return <StudentAssignments />;
    if (pageKey === "student/tasks") return <StudentTasks />;
    if (pageKey === "student/messages") return <StudentMessages />;
    if (pageKey === "student/certificates") return <StudentCertificates />;
    if (pageKey === "student/internship-dashboard" || pageKey === "student/internships") {
      return <ProgramDashboard mode="internship" role="student" />;
    }
    if (pageKey === "student/internship-training-dashboard") {
      return <ProgramDashboard mode="training-internship" role="student" />;
    }
    if (pageKey === "student/projects") return <AiFeaturesView />;

    // Admin Workspace routing
    if (pageKey.startsWith("admin/student")) return <AdminStudents />;
    if (pageKey.startsWith("admin/course")) return <AdminCourses />;
    if (pageKey === "admin/internship-dashboard" || pageKey === "admin/internships") {
      return <ProgramDashboard mode="internship" role="admin" />;
    }
    if (pageKey === "admin/internship-training-dashboard") {
      return <ProgramDashboard mode="training-internship" role="admin" />;
    }
    if (pageKey === "admin/payments" || pageKey === "admin/reports") return <AdminPayments />;
    if (pageKey === "admin/notifications") return <AiFeaturesView />;
    if (pageKey === "admin/mentors") return <AdminMentors />;
    if (pageKey === "admin/hr") return <AdminHr />;
    if (pageKey === "admin/settings") return <StudentProfile />;

    // HR Workspace routing
    if (pageKey.startsWith("hr/")) return <HrDashboardViews viewKey={pageKey} />;

    // Mentor Workspace routing
    if (pageKey === "mentor/students") return <AdminStudents />;
    if (pageKey === "mentor/courses") return <AdminCourses />;
    if (pageKey === "mentor/assignments" || pageKey === "mentor/reviews") return <StudentAssignments />;
    if (pageKey === "mentor/tasks") return <StudentTasks />;
    if (pageKey === "mentor/messages") return <StudentMessages />;
    if (pageKey === "mentor/reports" || pageKey === "mentor/profile") return <StudentProfile />;

    // Fallback Mock view
    const sampleRows = [
      "Role based access control verified",
      "Realtime API sync online",
      "Export reports ready",
      "AI assistant pipeline ready"
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sampleRows.map((item) => (
          <Card key={item}>
            <CardContent className="p-5">
              <p className="text-sm font-semibold">{item}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Production module ready for API integration, analytics, audit trails, and permission checks.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
            value={`/${pageKey}`}
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
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">{role} workspace</p>
              <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{content.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{content.description}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {content.secondaryAction ? <Button variant="outline">{content.secondaryAction}</Button> : null}
              {content.primaryAction ? <Button>{content.primaryAction}</Button> : null}
            </div>
          </div>
          {renderView()}
        </div>
      </main>
    </div>
  );
}
