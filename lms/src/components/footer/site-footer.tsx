import { brand } from "@/assets/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold">{brand.product}</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Courses, internships, certificates, placement workflows, and analytics for career-ready teams.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Platform</p>
          <p className="mt-3 text-sm text-muted-foreground">Courses</p>
          <p className="mt-2 text-sm text-muted-foreground">Internships</p>
          <p className="mt-2 text-sm text-muted-foreground">Certificates</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Support</p>
          <p className="mt-3 text-sm text-muted-foreground">{brand.supportEmail}</p>
          <p className="mt-2 text-sm text-muted-foreground">Ahmedabad, India</p>
        </div>
      </div>
    </footer>
  );
}
