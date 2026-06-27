"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  PlayCircle,
  UsersRound,
  Video,
  Loader2,
  Award,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { http } from "@/services/http";

export type ProgramDashboardMode = "internship" | "training-internship";
type ProgramDashboardRole = "student" | "admin";

type Stat = {
  label: string;
  value: string;
  delta: string;
  icon: typeof BriefcaseBusiness;
  tone: string;
};

type TimelineItem = {
  title: string;
  meta: string;
  status: string;
};

type WorkItem = {
  title: string;
  owner: string;
  due: string;
  status: string;
  progress: number;
};

export function ProgramDashboard({ mode, role = "student" }: { mode: ProgramDashboardMode; role?: ProgramDashboardRole }) {
  const [selectedMode, setSelectedMode] = useState<ProgramDashboardMode>(mode);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const isAdmin = role === "admin";

  const fetchDashboardData = async (type: ProgramDashboardMode) => {
    try {
      setLoading(true);
      const response = await http.get("/internships/dashboard", {
        params: { type, role }
      });
      setDashboardData(response);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedMode);
  }, [selectedMode, role]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs text-slate-500 font-medium">Loading workspace metrics...</span>
      </div>
    );
  }

  // Student Empty State: If not admin and there are no active internships assigned
  const hasActiveInternship = dashboardData?.internships && dashboardData.internships.length > 0;
  if (!isAdmin && !hasActiveInternship) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow bg-card max-w-2xl mx-auto">
        <CardContent className="p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center mx-auto mb-2">
            <BriefcaseBusiness className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Active Internship or Training Batch Assigned</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You are currently not registered in an active corporate internship or training batch. 
            Once you enroll and the Amit Solution Hub admin assigns you to a batch and mentor, your performance tracking, timeline, and deliverables will be displayed here.
          </p>
          <div className="pt-2">
            <Button onClick={() => window.location.href = "/student/courses"} className="text-xs h-9 px-4 font-semibold">
              Browse Available Courses
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate live database-driven statistics
  const totalInternships = dashboardData?.stats?.total ?? 0;
  const activeInternships = dashboardData?.stats?.active ?? 0;
  const completedInternships = dashboardData?.stats?.completed ?? 0;
  const tasksOpen = dashboardData?.stats?.tasksOpen ?? 0;
  const completionRate = totalInternships > 0 ? Math.round((completedInternships / totalInternships) * 100) : 0;

  const statsToRender: Stat[] = [
    {
      label: "Total Trainees",
      value: String(totalInternships),
      delta: "Registered",
      icon: BriefcaseBusiness,
      tone: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20"
    },
    {
      label: "Active Campaigns",
      value: String(activeInternships),
      delta: "In progress",
      icon: UsersRound,
      tone: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20"
    },
    {
      label: "Open Submissions",
      value: String(tasksOpen),
      delta: "Awaiting review",
      icon: ClipboardCheck,
      tone: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20"
    },
    {
      label: "Completed Slots",
      value: String(completedInternships),
      delta: "Evaluations closed",
      icon: Award,
      tone: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20"
    }
  ];

  const focusCardsToRender = selectedMode === "internship"
    ? [
        { label: isAdmin ? "Total Active Interns" : "Assigned Mentor", value: isAdmin ? String(activeInternships) : (dashboardData?.internships?.[0]?.mentorId?.name || "Unassigned"), icon: UsersRound },
        { label: "Duration", value: "6 Months", icon: CalendarCheck },
        { label: isAdmin ? "Tasks Reviewed" : "Tasks Done", value: String(dashboardData?.stats?.tasksCompleted ?? 0), icon: ClipboardCheck }
      ]
    : [
        { label: "Next Session", value: "TBA by Mentor", icon: Video },
        { label: "Cohort Batch", value: dashboardData?.internships?.[0]?.cohort || "None", icon: Layers3 },
        { label: isAdmin ? "Avg Progress" : "My Progress", value: `${completionRate}%`, icon: PlayCircle }
      ];

  const workToRender: WorkItem[] = (dashboardData?.tasks && dashboardData.tasks.length > 0)
    ? dashboardData.tasks.map((t: any) => ({
        title: t.title,
        owner: t.assignedTo?.userId?.name || "Trainee",
        due: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "TBA",
        status: t.status === "todo" ? "To Do" : t.status === "in-progress" ? "In Progress" : "Completed",
        progress: t.status === "reviewed" ? 100 : t.status === "in-progress" ? 50 : 0
      }))
    : [];

  const timelineToRender: TimelineItem[] = hasActiveInternship
    ? [
        { title: "Internship Initiated", meta: `Assigned on ${new Date(dashboardData.internships[0].createdAt).toLocaleDateString()}`, status: "Success" }
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Admin Mode Selector */}
      {isAdmin && (
        <Card className="border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Select Campaign View</p>
                <p className="text-xs text-muted-foreground mt-1">Choose between Internship or Internship + Training cohorts</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMode("internship")}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                    selectedMode === "internship"
                      ? "bg-primary text-white shadow-lg"
                      : "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                  )}
                  disabled={loading}
                >
                  Internship
                </button>
                <button
                  onClick={() => setSelectedMode("training-internship")}
                  className={cn(
                    "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                    selectedMode === "training-internship"
                      ? "bg-primary text-white shadow-lg"
                      : "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                  )}
                  disabled={loading}
                >
                  Internship + Training
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-6 md:grid-cols-[1.35fr_0.65fr]">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardContent className="p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  {selectedMode === "internship" ? "Internship workspace" : "Training + internship workspace"}
                </Badge>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {selectedMode === "internship" ? "Internship Dashboard" : "Internship + Training Dashboard"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {selectedMode === "internship"
                    ? "Mentor allocation, weekly reports, assigned tasks, project reviews, and completion letter readiness."
                    : "Course learning, live classes, module assignments, internship tasks, capstone progress, and certificate status."}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {focusCardsToRender.map((item) => (
                <div
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/45"
                  key={item.label}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </div>
                  <p className="mt-2 text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-primary" />
              {isAdmin ? "Cohort Progress Health" : "My Completion Progress"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            <div>
              <div className="flex justify-between text-xs font-semibold">
                <span>Completion Status</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="mt-2 h-2" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                <p className="text-muted-foreground">{isAdmin ? "Total Campaigns" : "Weekly Report"}</p>
                <p className="mt-1 text-base font-bold">{isAdmin ? totalInternships : "Submitted"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                <p className="text-muted-foreground">{isAdmin ? "Completed Slots" : "Review Date"}</p>
                <p className="mt-1 text-base font-bold">{isAdmin ? completedInternships : "Pending"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsToRender.map((stat) => (
          <Card className="border border-slate-200 dark:border-slate-800" key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{stat.delta}</p>
                </div>
                <span className={cn("grid h-10 w-10 place-items-center rounded-lg", stat.tone)}>
                  <stat.icon className="h-5 w-5" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold">{selectedMode === "internship" ? "Internship Work Queue" : "Training + Internship Work Queue"}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Batch-level ownership, due dates, and progress tracking." : "Your current learning and internship deliverables."}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-y bg-slate-50 text-muted-foreground dark:bg-slate-900/60">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Work Item</th>
                    <th className="px-5 py-3 font-semibold">Owner</th>
                    <th className="px-5 py-3 font-semibold">Due Date</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {workToRender.map((item, index) => (
                    <tr className="border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/20" key={index}>
                      <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{item.title}</td>
                      <td className="px-5 py-4 text-muted-foreground">{item.owner}</td>
                      <td className="px-5 py-4 text-muted-foreground">{item.due}</td>
                      <td className="px-5 py-4">
                        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">{item.status}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Progress value={item.progress} className="h-1.5 min-w-28" />
                          <span className="w-9 text-right font-semibold">{item.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {workToRender.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No internship tasks or syllabus deliverables assigned.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              Milestone Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            {timelineToRender.map((item, index) => (
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800" key={index}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <Badge className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}

            {timelineToRender.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No timeline milestones recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
export default ProgramDashboard;
