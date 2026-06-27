"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser, Role } from "@/types";

export default function SSOPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("No token found. Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 2000);
      return;
    }

    const verifyTokenAndFetchProfile = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const baseApiUrl = apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");
        const profileUrl = `${baseApiUrl}/api/users/me`;

        const response = await fetch(profileUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load user profile");
        }

        const data = await response.json();
        if (!data.success || !data.profile) {
          throw new Error(data.message || "Invalid profile data");
        }

        const profile = data.profile;
        let resolvedRole: Role = "student";
        if (profile.role === "admin") {
          resolvedRole = "admin";
        } else if (profile.role === "employee") {
          resolvedRole = profile.department?.toLowerCase() === "hr" ? "hr" : "mentor";
        } else {
          resolvedRole = "student";
        }

        const user: AuthUser = {
          id: profile.uid || profile.id,
          name: profile.displayName || profile.name || "User",
          email: profile.email,
          role: resolvedRole,
          avatarUrl: profile.avatar || profile.photoURL || "",
        };

        setSession(user, token);

        if (resolvedRole === "admin") {
          router.push("/admin/dashboard");
        } else if (resolvedRole === "hr") {
          router.push("/hr/dashboard");
        } else if (resolvedRole === "mentor") {
          router.push("/mentor/dashboard");
        } else {
          router.push("/student/courses");
        }
      } catch (err: any) {
        console.error("SSO Error:", err);
        setError(err.message || "Failed to authenticate session.");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    verifyTokenAndFetchProfile();
  }, [searchParams, router, setSession]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-xl">
        {error ? (
          <div>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Authentication Failed</h2>
            <p className="mt-2 text-sm text-slate-400">{error}</p>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <h2 className="text-xl font-bold">Authenticating</h2>
            <p className="mt-2 text-sm text-slate-400">Verifying your secure session with AmitSolutionHub...</p>
          </div>
        )}
      </div>
    </div>
  );
}
