"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, FileText, CheckCircle2, Calendar, ArrowRight, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { http } from "@/services/http";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: "Pending" | "Submitted" | "Reviewed";
  description: string;
  grade?: string;
  feedback?: string;
}

export function StudentAssignments() {
  const user = useAuthStore((s) => s.user);
  const [studentId, setStudentId] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  // Get student ID first
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const res: any = await http.get("/students/me");
        if (res && res._id) {
          setStudentId(res._id);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchStudentProfile();
  }, []);

  // Fetch assignments on mount or when studentId is resolved
  useEffect(() => {
    const fetchAssignments = async () => {
      setFetching(true);
      try {
        const res: any = await http.get("/assignments");
        const items = res?.items || [];
        const mapped = items.map((asm: any) => {
          const studentSub = asm.submissions?.find(
            (s: any) => String(s.studentId?._id || s.studentId) === String(studentId)
          );

          let status: "Pending" | "Submitted" | "Reviewed" = "Pending";
          if (studentSub) {
            status = studentSub.status === "reviewed" ? "Reviewed" : "Submitted";
          }

          return {
            id: asm._id,
            title: asm.title,
            course: asm.courseId?.title || "Full Stack Web Development",
            dueDate: new Date(asm.dueDate).toISOString().slice(0, 10),
            status,
            description: asm.instructions || "",
            grade: studentSub?.score !== undefined ? `${studentSub.score}/${asm.maxScore || 100}` : undefined,
            feedback: studentSub?.feedback
          };
        });
        setAssignments(mapped);
      } catch (err) {
        console.error("Failed to load assignments", err);
      } finally {
        setFetching(false);
      }
    };

    fetchAssignments();
  }, [studentId]);

  const handleOpenSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionLink("");
    setSuccess(null);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionLink.trim() || !selectedAssignment) return;
    setLoading(true);

    try {
      await http.post(`/assignments/${selectedAssignment.id}/submit`, {
        fileUrl: submissionLink,
        notes: "Submitted via LMS Student portal."
      });

      setAssignments(
        assignments.map((a) =>
          a.id === selectedAssignment.id
            ? { ...a, status: "Submitted" as const }
            : a
        )
      );
      setSuccess("Assignment file link submitted successfully!");
      setTimeout(() => {
        setSelectedAssignment(null);
      }, 1500);
    } catch (err: any) {
      alert("Submission failed: " + (err.message || "Error"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs text-slate-500 font-medium">Fetching assignments registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedAssignment ? (
        <Card className="max-w-2xl mx-auto border border-slate-200 dark:border-slate-800 shadow">
          <CardHeader className="p-6 border-b">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">{selectedAssignment.course}</span>
            <CardTitle className="text-lg font-bold mt-1">{selectedAssignment.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Due Date: {selectedAssignment.dueDate}</p>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs leading-relaxed text-slate-500 border">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Description:</p>
              {selectedAssignment.description}
            </div>

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submission URL / GitHub Repo</label>
                <div className="relative">
                  <Upload className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    className="w-full h-10 pl-9 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://github.com/yourusername/project-repo"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setSelectedAssignment(null)} className="text-xs h-9">
                  Cancel
                </Button>
                <Button disabled={loading} type="submit" className="text-xs h-9 font-semibold">
                  {loading ? "Submitting..." : "Submit Assignment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="border border-slate-200 dark:border-slate-800 bg-card hover:shadow transition">
              <CardHeader className="p-5 border-b">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${
                    assignment.status === "Pending"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : assignment.status === "Submitted"
                      ? "bg-primary/10 text-primary"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  }`}>
                    {assignment.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {assignment.dueDate}
                  </span>
                </div>
                <CardTitle className="text-base font-bold mt-3 leading-snug line-clamp-1">{assignment.title}</CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">{assignment.course}</p>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {assignment.description}
                </p>

                {assignment.status === "Reviewed" && assignment.grade && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Grade Received:</span>
                      <span>{assignment.grade}</span>
                    </div>
                    {assignment.feedback && (
                      <p className="text-[11px] text-slate-400 italic">"{assignment.feedback}"</p>
                    )}
                  </div>
                )}

                {assignment.status === "Pending" && (
                  <Button onClick={() => handleOpenSubmit(assignment)} className="w-full text-xs font-semibold h-9">
                    Submit Assignment <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}

          {assignments.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 border border-dashed rounded-lg bg-card">
              <ClipboardCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              No assignments assigned. Seed the database to view live assignments.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default StudentAssignments;
