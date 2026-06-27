import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true,
  timeout: 20_000
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true && "data" in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
