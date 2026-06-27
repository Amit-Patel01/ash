"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LockKeyhole, Mail, UserRound, Phone, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth-store";

type AuthMode = "login" | "register" | "forgot-password" | "reset-password" | "verify-otp" | "change-password";

const copy: Record<AuthMode, { title: string; description: string; button: string }> = {
  login: { title: "Welcome Back", description: "Access your LMS workspace.", button: "Login" },
  register: { title: "Create Account", description: "Join Amit Solution Hub LMS.", button: "Register" },
  "forgot-password": { title: "Forgot Password", description: "Receive an OTP to reset access.", button: "Send OTP" },
  "reset-password": { title: "Reset Password", description: "Create a strong new password.", button: "Reset Password" },
  "verify-otp": { title: "Verify OTP", description: "Confirm your email verification code.", button: "Verify OTP" },
  "change-password": { title: "Change Password", description: "Update your account password.", button: "Change Password" }
};

export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"student" | "mentor" | "hr" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParams = new URLSearchParams(window.location.search);
      const emailParam = queryParams.get("email");
      if (emailParam) setEmail(emailParam);
      const otpParam = queryParams.get("otp");
      if (otpParam) setOtp(otpParam);
    }
  }, [mode]);

  const content = copy[mode];
  const showName = mode === "register";
  const showPhone = mode === "register";
  const showRole = false;
  const showOtp = mode === "verify-otp" || mode === "reset-password";
  const showPassword = mode !== "forgot-password" && mode !== "verify-otp";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "login") {
        if (!email || !password) throw new Error("Please fill in all fields.");
        const res = await authService.login({ email, password });
        setSession(res.user, res.accessToken);
        setSuccess("Login successful! Redirecting...");
        
        // Redirect to appropriate dashboard based on role
        setTimeout(() => {
          const targetRole = res.user.role === "super-admin" ? "admin" : res.user.role;
          router.push(`/${targetRole}/dashboard`);
        }, 150);
      } else if (mode === "register") {
        if (!name || !email || !password || !phone) throw new Error("Please fill in all fields.");
        const res = await authService.register({ name, email, password, phone, role });
        setSession(res.user, res.accessToken);
        setSuccess("Registration successful! Redirecting to OTP verification...");
        
        setTimeout(() => {
          router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 150);
      } else if (mode === "forgot-password") {
        if (!email) throw new Error("Please enter your email.");
        await authService.forgotPassword(email);
        setSuccess("OTP sent to your email! Redirecting to reset page...");
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 150);
      } else if (mode === "verify-otp") {
        const queryParams = new URLSearchParams(window.location.search);
        const emailParam = queryParams.get("email") || email;
        if (!emailParam || !otp) throw new Error("Please enter OTP and email.");
        await authService.verifyOtp({ email: emailParam, otp });
        setSuccess("Email verified successfully! Redirecting...");
        setTimeout(() => {
          const isReset = queryParams.get("reset") === "true";
          if (isReset) {
            router.push(`/auth/reset-password?email=${encodeURIComponent(emailParam)}&otp=${otp}`);
          } else {
            router.push(`/student/dashboard`);
          }
        }, 150);
      } else if (mode === "reset-password") {
        const queryParams = new URLSearchParams(window.location.search);
        const emailParam = queryParams.get("email") || email;
        const otpParam = queryParams.get("otp") || otp;
        if (!emailParam || !otpParam || !password) throw new Error("Missing required fields.");
        
        await authService.resetPassword({ email: emailParam, otp: otpParam, password });
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 150);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden relative bg-[url('/images/ash-lms-hero.png')] bg-cover bg-center lg:flex flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-slate-950/20" />
        <div className="relative z-10 flex items-center gap-3">
          <img src="/images/logo.png" alt="ASH Logo" className="h-9 w-9 object-contain rounded-md" />
          <span className="font-bold text-lg tracking-wider">AMIT SOLUTION HUB</span>
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold font-serif leading-tight">Elevate Your Development Career with LMS Portal</h2>
          <p className="text-slate-200 text-sm max-w-md leading-relaxed">
            Gain verified professional certificates, complete hands-on internships, work with dedicated industry mentors, and lock in placement readiness.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10 bg-slate-50 dark:bg-slate-950/40">
        <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">{content.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {showName && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Name</label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
                      placeholder="Amit Patel"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
                    placeholder="you@example.com"
                    type="email"
                    required
                  />
                </div>
              </div>

              {showPhone && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone Number</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
                      placeholder="+91 98765 43210"
                      type="tel"
                      required
                    />
                  </div>
                </div>
              )}

              {showRole && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Select Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["student", "mentor", "hr"] as const).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`py-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                          role === r
                            ? "bg-primary border-primary text-primary-foreground shadow"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showOtp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">OTP Code</label>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-10 border-slate-200 dark:border-slate-800 focus-visible:ring-primary text-center tracking-widest text-lg font-bold"
                    inputMode="numeric"
                    placeholder="6 digit code"
                    maxLength={6}
                    required
                  />
                </div>
              )}

              {showPassword && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-10 border-slate-200 dark:border-slate-800 focus-visible:ring-primary"
                      placeholder="••••••••"
                      type="password"
                      required
                    />
                  </div>
                </div>
              )}

              <Button disabled={loading} className="w-full h-10 font-semibold shadow-md mt-6" type="submit">
                {loading ? "Processing..." : content.button}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between text-xs font-medium text-slate-500">
              <Link href="/auth/forgot-password" className="hover:text-primary transition-colors">
                Forgot password?
              </Link>
              <Link
                href={mode === "register" ? "/auth/login" : "/auth/register"}
                className="text-primary hover:underline transition-all"
              >
                {mode === "register" ? "Already have an account? Login" : "New user? Create account"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

