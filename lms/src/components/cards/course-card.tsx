import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Course } from "@/types";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <Badge>{course.level}</Badge>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent-foreground">
            <Star className="h-4 w-4 fill-accent text-accent" />
            {course.rating}
          </span>
        </div>
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{course.duration}</span>
          <span>{course.enrolled.toLocaleString("en-IN")} learners</span>
        </div>
        <Progress value={course.progress ?? 0} />
      </CardContent>
    </Card>
  );
}
