"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface JobPosting {
  id: string;
  role: string;
  company: string;
  location: string;
  openings: number;
  applicants: number;
  status: "Active" | "Closed";
}

interface Application {
  id: string;
  name: string;
  roleApplied: string;
  matchScore: number;
  status: "Shortlisted" | "Screening" | "Offered" | "Rejected";
  resumeUrl: string;
}

interface Interview {
  id: string;
  candidateName: string;
  roleName: string;
  timeSlot: string;
  panel: string;
  status: "Scheduled" | "Completed" | "No Show";
}

const initialJobs: JobPosting[] = [
  { id: "j1", role: "Frontend developer (Next.js)", company: "Amit Solution Hub", location: "Vadodara (On-site)", openings: 3, applicants: 42, status: "Active" },
  { id: "j2", role: "Full Stack Engineer Intern", company: "ASH Systems", location: "Remote", openings: 5, applicants: 118, status: "Active" }
];

const initialApplications: Application[] = [
  { id: "ap1", name: "John Doe", roleApplied: "Full Stack Engineer Intern", matchScore: 94, status: "Shortlisted", resumeUrl: "#" },
  { id: "ap2", name: "Jane Smith", roleApplied: "Frontend developer (Next.js)", matchScore: 88, status: "Screening", resumeUrl: "#" },
  { id: "ap3", name: "Anil Kumar", roleApplied: "Full Stack Engineer Intern", matchScore: 62, status: "Rejected", resumeUrl: "#" }
];

const initialInterviews: Interview[] = [
  { id: "i1", candidateName: "John Doe", roleName: "Full Stack Engineer Intern", timeSlot: "2026-06-01 10:30 AM", panel: "Rohan Gupta", status: "Scheduled" },
  { id: "i2", candidateName: "Jane Smith", roleName: "Frontend developer (Next.js)", timeSlot: "2026-06-02 02:00 PM", panel: "Amit Patel", status: "Scheduled" }
];

export function HrDashboardViews({ viewKey }: { viewKey: string }) {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  const [isAddingJob, setIsAddingJob] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [jobOpenings, setJobOpenings] = useState("2");
  
  const [isScheduling, setIsScheduling] = useState(false);
  const [candidate, setCandidate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  useEffect(() => {
    const savedJobs = localStorage.getItem("ash_jobs");
    const savedApps = localStorage.getItem("ash_apps");
    const savedInterviews = localStorage.getItem("ash_interviews");
    
    if (savedJobs) setJobs(JSON.parse(savedJobs));
    else setJobs(initialJobs);
    
    if (savedApps) setApps(JSON.parse(savedApps));
    else setApps(initialApplications);
    
    if (savedInterviews) setInterviews(JSON.parse(savedInterviews));
    else setInterviews(initialInterviews);
  }, []);

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole) return;
    const newJob: JobPosting = {
      id: "j-" + (jobs.length + 1),
      role: jobRole,
      company: "Amit Solution Hub",
      location: "Remote",
      openings: Number(jobOpenings),
      applicants: 0,
      status: "Active"
    };
    const updated = [newJob, ...jobs];
    setJobs(updated);
    localStorage.setItem("ash_jobs", JSON.stringify(updated));
    setIsAddingJob(false);
    setJobRole("");
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate || !timeSlot) return;
    const newInt: Interview = {
      id: "i-" + (interviews.length + 1),
      candidateName: candidate,
      roleName: "Full Stack Engineer Intern",
      timeSlot,
      panel: "Rohan Gupta",
      status: "Scheduled"
    };
    const updated = [newInt, ...interviews];
    setInterviews(updated);
    localStorage.setItem("ash_interviews", JSON.stringify(updated));
    setIsScheduling(false);
    setCandidate("");
    setTimeSlot("");
  };

  const handleShortlist = (appId: string, nextStatus: Application["status"]) => {
    const updated = apps.map((a) => (a.id === appId ? { ...a, status: nextStatus } : a));
    setApps(updated);
    localStorage.setItem("ash_apps", JSON.stringify(updated));
  };

  if (viewKey === "hr/job-postings") {
    return (
      <div className="space-y-6">
        {isAddingJob ? (
          <Card className="max-w-md mx-auto border shadow">
            <CardHeader className="p-5 border-b flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold">Create New Job Posting</CardTitle>
              <Button variant="outline" onClick={() => setIsAddingJob(false)} className="h-8 px-2"><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Job Role / Title</label>
                  <Input value={jobRole} onChange={(e) => setJobRole(e.target.value)} placeholder="NodeJS Developer" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Number of Openings</label>
                  <Input type="number" value={jobOpenings} onChange={(e) => setJobOpenings(e.target.value)} className="text-xs" required />
                </div>
                <Button type="submit" className="w-full text-xs h-9 px-4 font-semibold">Post Active Opening</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Job Postings Manager</h3>
              <Button onClick={() => setIsAddingJob(true)} className="text-xs h-9 px-3"><Plus className="h-4 w-4 mr-1" /> Add Job</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <Card key={job.id} className="border bg-card">
                  <CardHeader className="p-4 border-b flex justify-between flex-row items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{job.role}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{job.company} &bull; {job.location}</p>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">{job.status}</span>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <p className="text-[10px] text-slate-400">Openings</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{job.openings}</p>
                    </div>
                    <div className="p-2 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                      <p className="text-[10px] text-slate-400">Applicants</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{job.applicants}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (viewKey === "hr/applications") {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-bold">Candidate Applications</h3>
        <div className="grid gap-4">
          {apps.map((app) => (
            <Card key={app.id} className="border bg-card">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{app.name}</h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded capitalize bg-primary/10 text-primary">
                      Match Score: {app.matchScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Applied for: {app.roleApplied}</p>
                </div>

                <div className="flex gap-2">
                  {app.status === "Screening" && (
                    <>
                      <Button onClick={() => handleShortlist(app.id, "Shortlisted")} variant="outline" className="text-xs h-8 px-3 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10">Shortlist</Button>
                      <Button onClick={() => handleShortlist(app.id, "Rejected")} variant="outline" className="text-xs h-8 px-3 border-rose-500 text-rose-500 hover:bg-rose-50/10">Reject</Button>
                    </>
                  )}
                  {app.status !== "Screening" && (
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded border capitalize ${
                      app.status === "Shortlisted" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    }`}>
                      {app.status}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (viewKey === "hr/interviews") {
    return (
      <div className="space-y-6">
        {isScheduling ? (
          <Card className="max-w-md mx-auto border shadow">
            <CardHeader className="p-5 border-b flex flex-row justify-between items-center">
              <CardTitle className="text-sm font-bold">Schedule Interview Panel</CardTitle>
              <Button variant="outline" onClick={() => setIsScheduling(false)} className="h-8 px-2"><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleSchedule} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Candidate Name</label>
                  <Input value={candidate} onChange={(e) => setCandidate(e.target.value)} placeholder="John Doe" className="text-xs" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-slate-500">Time & Date</label>
                  <Input value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} placeholder="2026-06-05 11:00 AM" className="text-xs" required />
                </div>
                <Button type="submit" className="w-full text-xs h-9 px-4 font-semibold">Schedule Panel Slot</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Interview Schedules</h3>
              <Button onClick={() => setIsScheduling(true)} className="text-xs h-9 px-3"><Plus className="h-4 w-4 mr-1" /> Schedule</Button>
            </div>
            <div className="grid gap-4">
              {interviews.map((int) => (
                <Card key={int.id} className="border bg-card">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{int.candidateName}</h4>
                      <p className="text-xs text-slate-400">Role: {int.roleName} &bull; Panel: {int.panel}</p>
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <p className="text-xs font-mono text-slate-500 font-medium">{int.timeSlot}</p>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded capitalize bg-primary/10 text-primary">{int.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback placements view
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold">Verified Placements Ledger</h3>
      <div className="grid gap-4">
        {[
          { name: "Anish Dev", company: "ASH Systems", package: "₹8.4 LPA", role: "Junior Full Stack Dev", verifyHash: "0xASH7a9d023" },
          { name: "Simran Kaur", company: "Amit Solution Hub", package: "₹7.2 LPA", role: "Associate Frontend Engineer", verifyHash: "0xASH983b7ac" }
        ].map((item, index) => (
          <Card key={index} className="border bg-card">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{item.name}</h4>
                <p className="text-xs text-slate-400">{item.role} &bull; {item.company}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-bold text-emerald-500">{item.package}</p>
                <p className="text-[10px] text-muted-foreground font-mono">ID: {item.verifyHash}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
