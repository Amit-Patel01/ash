"use client";

import { useState, useEffect } from "react";
import { Target, CheckCircle2, Calendar, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { http } from "@/services/http";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In-Progress" | "Completed";
  description: string;
  assigner: string;
}

export function StudentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filterStatus, setFilterStatus] = useState<"All" | "Pending" | "In-Progress" | "Completed">("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/tasks");
        const items = res?.items || [];
        const mapped = items.map((t: any) => {
          let priority: Task["priority"] = "Medium";
          if (t.priority === "high") priority = "High";
          if (t.priority === "low") priority = "Low";
          
          let status: Task["status"] = "Pending";
          if (t.status === "in-progress") status = "In-Progress";
          if (t.status === "completed" || t.status === "reviewed") status = "Completed";

          return {
            id: t._id,
            title: t.title,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : "2026-06-30",
            priority,
            status,
            description: t.description || "",
            assigner: t.assignedBy?.name || "Amit Patel (Admin)"
          };
        });
        setTasks(mapped);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId: string, nextStatus: Task["status"]) => {
    let dbStatus = "todo";
    if (nextStatus === "In-Progress") dbStatus = "in-progress";
    if (nextStatus === "Completed") dbStatus = "completed";

    try {
      await http.patch(`/tasks/${taskId}`, { status: dbStatus });
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Error"));
    }
  };

  const filteredTasks = tasks.filter(
    (t) => filterStatus === "All" || t.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs text-slate-500 font-medium">Fetching assigned tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        {(["All", "Pending", "In-Progress", "Completed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition ${
              filterStatus === status
                ? "bg-primary border-primary text-primary-foreground shadow"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="border border-slate-200 dark:border-slate-800 bg-card hover:shadow-md transition">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    task.priority === "High"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Due {task.dueDate}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{task.title}</h3>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">{task.description}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <User className="h-3 w-3" /> Assigned by: {task.assigner}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex flex-row md:flex-col gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                <p className="text-xs font-semibold text-slate-400 block md:hidden mr-auto pt-1">Update Status:</p>
                <div className="flex gap-2">
                  {task.status !== "Completed" && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(task.id, task.status === "Pending" ? "In-Progress" : "Completed")}
                      className="text-[11px] h-8 px-3 font-medium"
                    >
                      {task.status === "Pending" ? "Start Task" : "Complete Task"}
                    </Button>
                  )}
                  {task.status === "Completed" && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-1">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" /> Done
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="p-8 border border-dashed text-center rounded-lg text-xs text-slate-400">
            <Target className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            No tasks found matching the selected filter status.
          </div>
        )}
      </div>
    </div>
  );
}
export default StudentTasks;
