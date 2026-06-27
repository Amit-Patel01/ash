"use client";

import { useState } from "react";
import { Sparkles, Brain, FileText, Lightbulb, UserCheck, Play, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { http } from "@/services/http";

export function AiFeaturesView() {
  const [activeTab, setActiveTab] = useState<"resume" | "project" | "interview">("resume");
  const [loading, setLoading] = useState(false);

  // Resume state
  const [skills, setSkills] = useState("React, NodeJS, Express, MongoDB");
  const [suggestedPoints, setSuggestedPoints] = useState<string[]>([]);

  // Project state
  const [interest, setInterest] = useState("NextJS 15 webapps");
  const [projectsList, setProjectsList] = useState<string[]>([]);

  // Interview state
  const [role, setRole] = useState("Full Stack Developer");
  const [questions, setQuestions] = useState<string[]>([]);

  const handleGenResume = async () => {
    setLoading(true);
    setSuggestedPoints([]);
    try {
      const res: any = await http.post("/ai/resume-builder", { skills });
      setSuggestedPoints(res.points || []);
    } catch {
      setSuggestedPoints([
        "Designed and implemented high-throughput Express REST APIs using Node.js and Mongoose.",
        "Integrated secure authentication systems using JWT and OTP verification workflows.",
        "Established automated database backup and caching layers using Redis cache servers."
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenProject = async () => {
    setLoading(true);
    setProjectsList([]);
    try {
      const res: any = await http.post("/ai/project-suggestions", { skills: interest });
      const suggestions = res.map((p: any) => `${p.title} (${p.difficulty}): ${p.outcome}`);
      setProjectsList(suggestions || []);
    } catch {
      setProjectsList([
        "AI Quiz Generator (Intermediate): An interactive application that accepts text inputs and generates custom quizzes with automated timers.",
        "Secure Payments Hub (Advanced): A dashboard implementing Razorpay payment gateways, invoice export options, and webhook security.",
        "Realtime Collaboration Engine (Advanced): Collaborative workspace manager built using Socket.IO rooms and real-time state synchronization."
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenPrep = async () => {
    setLoading(true);
    setQuestions([]);
    try {
      const res: any = await http.post("/ai/interview-preparation", { role });
      setQuestions(res.questions || []);
    } catch {
      setQuestions([
        "What is the difference between React Server Components and Client Components?",
        "Explain how the JWT refresh token strategy operates. Where should you store tokens securely?",
        "How do you establish connection indexing in MongoDB to boost read queries?"
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector Tabs */}
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        {[
          { id: "resume", label: "AI Resume Points", icon: FileText },
          { id: "project", label: "AI Project Ideas", icon: Lightbulb },
          { id: "interview", label: "AI Interview Questions", icon: UserCheck }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition ${
              activeTab === tab.id
                ? "bg-primary border-primary text-primary-foreground shadow"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "resume" && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow bg-card">
          <CardHeader className="p-6 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-primary" /> AI Resume Point Builder
            </CardTitle>
            <p className="text-xs text-muted-foreground">Generate high-impact bullet points for your resume based on your tech stack.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Next.js, Node.js, Express, MongoDB"
                className="text-xs flex-1"
              />
              <Button disabled={loading} onClick={handleGenResume} className="text-xs font-semibold h-10 shrink-0">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Generate Points"}
              </Button>
            </div>

            {suggestedPoints.length > 0 && (
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Suggested Bullet Points</h4>
                <div className="space-y-2">
                  {suggestedPoints.map((point, index) => (
                    <div key={index} className="flex gap-2.5 items-start p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "project" && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow bg-card">
          <CardHeader className="p-6 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Brain className="h-4.5 w-4.5 text-primary" /> AI Internship Project Suggester
            </CardTitle>
            <p className="text-xs text-muted-foreground">Enter your area of interest to get customized project suggestions for your evaluation.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="NextJS webapps, AI integration..."
                className="text-xs flex-1"
              />
              <Button disabled={loading} onClick={handleGenProject} className="text-xs font-semibold h-10 shrink-0">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Suggest Projects"}
              </Button>
            </div>

            {projectsList.length > 0 && (
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Suggested Project Ideas</h4>
                <div className="space-y-3">
                  {projectsList.map((project, index) => (
                    <div key={index} className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border text-xs text-slate-600 dark:text-slate-400">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Idea #{index + 1}:</p>
                      <p className="mt-1 leading-relaxed">{project}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "interview" && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow bg-card">
          <CardHeader className="p-6 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <UserCheck className="h-4.5 w-4.5 text-primary" /> AI Interview Prep Simulator
            </CardTitle>
            <p className="text-xs text-muted-foreground">Get simulated technical interview questions specifically customized for your job profile.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Full Stack Developer, HR Specialist..."
                className="text-xs flex-1"
              />
              <Button disabled={loading} onClick={handleGenPrep} className="text-xs font-semibold h-10 shrink-0">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Get Questions"}
              </Button>
            </div>

            {questions.length > 0 && (
              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Simulated Interview Questions</h4>
                <div className="space-y-2">
                  {questions.map((q, index) => (
                    <div key={index} className="flex gap-2.5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-primary shrink-0">Q{index + 1}:</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
