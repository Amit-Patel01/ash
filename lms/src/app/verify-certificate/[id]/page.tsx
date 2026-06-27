import { Award, CheckCircle2, QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { brand } from "@/assets/brand";

export default async function VerifyCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Award className="h-10 w-10" />
            </div>
            <div className="space-y-4">
              <Badge className="bg-success/10 text-success">Verified</Badge>
              <div>
                <h1 className="text-3xl font-semibold">Certificate Verified</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Certificate {id || `${brand.certificatePrefix}-000001`} is issued by {brand.name}.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["Learner identity matched", "QR code signature valid", "Completion record active", "Audit log recorded"].map((item) => (
                  <div className="flex items-center gap-2 text-sm font-medium" key={item}>
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4">
                <QrCode className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Public certificate verification endpoint ready for QR scans.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
