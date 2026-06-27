import type { Metric } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{metric.delta}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
            <metric.icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
