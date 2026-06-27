import { Badge } from "@/components/ui/badge";
import type { Activity } from "@/types";

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div className="rounded-lg border border-border bg-card p-4" key={activity.title}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{activity.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
            </div>
            <Badge>{activity.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
