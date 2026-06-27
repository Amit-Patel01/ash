import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import type { Role } from "@/types";

export function useDashboard(role: Role) {
  return useQuery({
    queryKey: ["dashboard", role],
    queryFn: () => dashboardService.getDashboard(role)
  });
}
