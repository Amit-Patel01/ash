import { http } from "./http";
import type { Course } from "@/types";

export const courseService = {
  async list() {
    const { data } = await http.get<{ items: Course[] }>("/courses");
    return data.items;
  },
  async get(id: string) {
    const { data } = await http.get<Course>(`/courses/${id}`);
    return data;
  }
};
