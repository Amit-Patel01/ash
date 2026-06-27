import { http } from "./http";
import type { AuthUser } from "@/types";

type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await http.post<AuthResponse>("/auth/login", payload);
    return data;
  },
  async register(payload: Record<string, unknown>) {
    const { data } = await http.post<AuthResponse>("/auth/register", payload);
    return data;
  },
  async verifyOtp(payload: { email: string; otp: string }) {
    const { data } = await http.post("/auth/verify-otp", payload);
    return data;
  },
  async forgotPassword(email: string) {
    const { data } = await http.post("/auth/forgot-password", { email });
    return data;
  },
  async resetPassword(payload: Record<string, unknown>) {
    const { data } = await http.post("/auth/reset-password", payload);
    return data;
  },
  async refreshToken() {
    const { data } = await http.post<AuthResponse>("/auth/refresh-token");
    return data;
  },
  async logout() {
    const { data } = await http.post("/auth/logout");
    return data;
  }
};
