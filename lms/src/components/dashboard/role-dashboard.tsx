"use client";

import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MiniChart } from "@/components/charts/mini-chart";
import { DataTable } from "@/components/tables/data-table";
import { roleDashboards } from "@/utils/routes";
import type { Role, Metric } from "@/types";
import { http } from "@/services/http";

export function RoleDashboard({ role }: { role: Role }) {
  const dashboard = roleDashboards[role];
  const [metrics, setMetrics] = useState<Metric[]>(dashboard.metrics);
  const [chartBars, setChartBars] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [coursesRows, setCoursesRows] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res: any = await http.get("/reports/dashboard");
        if (res && res.metrics) {
          const updatedMetrics = res.metrics.map((m: any, idx: number) => {
            const staticMetric = dashboard.metrics[idx] || {};
            return {
              ...staticMetric,
              label: m.label || staticMetric.label,
              value: String(m.value) || staticMetric.value,
              delta: m.delta || staticMetric.delta
            };
          });
          setMetrics(updatedMetrics);
        }
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      }
    };

    const fetchDashboardDetails = async () => {
      if (role !== "admin") return;
      try {
        // Fetch courses for table
        const courseRes: any = await http.get("/courses");
        const courseItems = courseRes?.items || [];
        if (courseItems.length > 0) {
          const mappedRows = courseItems.slice(0, 5).map((c: any) => ({
            Name: c.title,
            Status: c.status === "published" ? "Active" : "Draft",
            Category: c.category || "General",
            Price: "₹" + (c.price || 0)
          }));
          setCoursesRows(mappedRows);
        } else {
          setCoursesRows([{ Name: "No courses created yet", Status: "Draft", Category: "None", Price: "₹0" }]);
        }

        // Fetch recent users as activities list
        const userRes: any = await http.get("/users");
        const userItems = Array.isArray(userRes) ? userRes : (userRes?.items || []);
        if (userItems && userItems.length > 0) {
          const mappedActs = userItems.slice(0, 5).map((u: any) => ({
            title: `New account: ${u.name || "User"}`,
            description: `Registered as ${u.role || "student"} (${u.email})`,
            status: u.isActive ? "Active" : "Inactive"
          }));
          setActivitiesList(mappedActs);
        } else {
          setActivitiesList([{
            title: "LMS initialized",
            description: "Ready to register students, mentors and HRs.",
            status: "Online"
          }]);
        }
      } catch (err) {
        console.error("Failed to load dashboard details", err);
        setCoursesRows([{ Name: "No courses created yet", Status: "Draft", Category: "None", Price: "₹0" }]);
        setActivitiesList([{
          title: "LMS initialized",
          description: "Ready to register students, mentors and HRs.",
          status: "Online"
        }]);
      }
    };

    fetchDashboardStats();
    fetchDashboardDetails();
  }, [role, dashboard.metrics]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Growth Analytics</h2>
            <p className="text-sm text-muted-foreground">Monthly activity, completion, revenue, and placement signals.</p>
          </div>
          <MiniChart bars={chartBars} />
          <DataTable rows={coursesRows} />
        </section>
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Live Activity</h2>
            <p className="text-sm text-muted-foreground">Realtime updates across the LMS workflow.</p>
          </div>
          <ActivityFeed activities={activitiesList} />
        </section>
      </div>
    </div>
  );
}
export default RoleDashboard;
