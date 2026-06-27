import { roleDashboards } from "@/utils/routes";
import type { DashboardResponse, Role } from "@/types";

export const dashboardService = {
  async getDashboard(role: Role): Promise<DashboardResponse> {
    const dashboard = roleDashboards[role];
    return Promise.resolve({
      metrics: dashboard.metrics,
      activities: dashboard.activities
    });
  }
};
