"use client";

import { useState, useEffect } from "react";
import { User, Phone, Mail, Award, FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { http } from "@/services/http";

export function StudentProfile() {
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.name || "Amit Patel");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [bio, setBio] = useState("Full Stack Developer Intern specializing in React, Next.js, and Node.js backend workflows.");
  const [resumeUrl, setResumeUrl] = useState("https://drive.google.com/file/d/amit-patel-resume/view");
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/students/me");
        if (res) {
          setName(res.userId?.name || "");
          setPhone(res.userId?.phone || "");
          setBio(res.userId?.bio || "");
          setResumeUrl(res.resumeUrl || "");
          setAvatar(res.userId?.avatarUrl || "");
        }
      } catch (err) {
        console.error("Failed to load student profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await http.patch("/students/me", { name, phone, bio, resumeUrl, avatarUrl: avatar });
      setMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile details." });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    // Cloudinary upload stub simulation
    setResumeUrl(`https://res.cloudinary.com/amit-solution-hub/raw/upload/${file.name}`);
    setMessage({ type: "success", text: `File "${file.name}" uploaded successfully to Cloudinary!` });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Profile Edit Card */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow">
        <CardHeader className="p-6 border-b">
          <CardTitle className="text-lg font-bold">Profile Information</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Manage learning identity, resume data, and verification details.</p>
        </CardHeader>
        <CardContent className="p-6">
          {message && (
            <div className={`mb-5 flex items-center gap-2 rounded-lg p-3 text-xs border ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }`}>
              {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-9 text-xs" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone Number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9 text-xs" type="tel" required />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={user?.email || "you@example.com"} className="pl-9 text-xs bg-slate-100 dark:bg-slate-900 cursor-not-allowed" readOnly />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full min-h-[90px] rounded-md border border-slate-200 dark:border-slate-800 p-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                placeholder="Write a brief professional summary..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resume Link</label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} className="pl-9 text-xs" placeholder="Drive or GitHub Resume URL" />
              </div>
            </div>

            <div className="pt-2">
              <Button disabled={loading} type="submit" className="text-xs font-semibold h-9 px-5">
                {loading ? "Saving changes..." : "Save Profile Details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Side Actions card */}
      <div className="space-y-4">
        <Card className="border border-slate-200 dark:border-slate-800 bg-card">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-primary" /> Resume Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your updated PDF resume to synchronize with Cloudinary placement parser.
            </p>
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-5 text-center bg-slate-50/50 dark:bg-slate-900/30">
              <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer block">
                <span className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-sm hover:opacity-90 transition-all inline-block">
                  Choose PDF File
                </span>
                <input type="file" accept=".pdf" onChange={handleUploadResume} className="hidden" />
              </label>
              <span className="text-[10px] text-muted-foreground mt-2 block">Maximum size 5MB (PDF only)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-card">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-500" /> Student Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4.5 w-4.5 fill-emerald-500/10" /> Profile Verified
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your profile is verified. You are eligible to receive internship offers and placement calls from verified employer HRs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
