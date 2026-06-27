import { RolePage } from "@/components/dashboard/role-page";

export default async function StudentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await params;
  return <RolePage pageKey="student/course/[id]" role="student" />;
}
