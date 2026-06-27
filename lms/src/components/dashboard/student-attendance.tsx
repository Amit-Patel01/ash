"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { http } from "@/services/http";

interface AttendanceRecord {
  date: string;
  status: "Present" | "Absent" | "Late" | "Holiday";
  checkIn: string;
  checkOut: string;
}

export function StudentAttendance() {
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/attendance");
        const items = res?.items || [];
        const mapped = items.map((l: any) => {
          let status: AttendanceRecord["status"] = "Present";
          if (l.status === "absent") status = "Absent";
          if (l.status === "late") status = "Late";
          if (l.status === "leave") status = "Holiday";

          return {
            date: new Date(l.date).toISOString().slice(0, 10),
            status,
            checkIn: l.status === "absent" ? "--" : "09:00 AM",
            checkOut: l.status === "absent" ? "--" : "06:00 PM"
          };
        });
        setLogs(mapped);
      } catch (err) {
        console.error("Failed to load attendance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const totalDays = logs.length;
  const presentDays = logs.filter((l) => l.status === "Present" || l.status === "Late").length;
  const lateDays = logs.filter((l) => l.status === "Late").length;
  const absentDays = logs.filter((l) => l.status === "Absent").length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  const handleExportExcel = () => {
    const headers = "Date,Status,Check In,Check Out\n";
    const rows = logs
      .map((l) => `${l.date},${l.status},${l.checkIn},${l.checkOut}`)
      .join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ASH-Attendance-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs text-slate-500 font-medium">Fetching attendance sign-ins...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attendance Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border border-slate-200 dark:border-slate-800 bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
            <p className="text-xl font-bold mt-1 text-primary">{attendancePercentage}%</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Present Days</p>
            <p className="text-xl font-bold mt-1 text-emerald-500">{presentDays} / {totalDays}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Late Check-ins</p>
            <p className="text-xl font-bold mt-1 text-amber-500">{lateDays}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 dark:border-slate-800 bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Absents</p>
            <p className="text-xl font-bold mt-1 text-rose-500">{absentDays}</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow">
        <CardHeader className="p-5 border-b flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <CalendarCheck className="h-4.5 w-4.5 text-primary" /> Attendance Logs
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Your daily sign-in and sign-out records</p>
          </div>
          <Button onClick={handleExportExcel} variant="outline" className="text-xs h-8 px-3 shrink-0" disabled={logs.length === 0}>
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b">
                <th className="p-4 font-semibold text-slate-500">Date</th>
                <th className="p-4 font-semibold text-slate-500">Status</th>
                <th className="p-4 font-semibold text-slate-500">Check In</th>
                <th className="p-4 font-semibold text-slate-500">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.date} className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="p-4 font-medium">{log.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 font-semibold rounded text-[10px] ${
                      log.status === "Present"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : log.status === "Late"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {log.status === "Present" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                      {log.status === "Late" && <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                      {log.status === "Absent" && <XCircle className="h-3.5 w-3.5 text-rose-500" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono">{log.checkIn}</td>
                  <td className="p-4 text-slate-500 font-mono">{log.checkOut}</td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    No attendance records found. Mark checking logs to see active logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
export default StudentAttendance;
