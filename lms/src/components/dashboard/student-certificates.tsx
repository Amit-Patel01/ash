"use client";

import { useState, useEffect } from "react";
import { Award, Eye, Download, ShieldCheck, QrCode, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { http } from "@/services/http";

interface Certificate {
  id: string;
  certNumber: string;
  courseTitle: string;
  issueDate: string;
  instructor: string;
  verificationUrl: string;
}

export function StudentCertificates() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const res: any = await http.get("/certificates");
        const items = res?.items || [];
        const mapped = items.map((c: any) => ({
          id: c._id,
          certNumber: c.certificateNumber || "ASH-CERT-GEN",
          courseTitle: c.courseId?.title || "Full Stack Web Development",
          issueDate: new Date(c.issuedAt || c.createdAt || Date.now()).toLocaleDateString(),
          instructor: c.issuedBy?.name || "Rohan Gupta (Mentor)",
          verificationUrl: c.verificationUrl || `/verify/${c.certificateNumber}`
        }));
        setCerts(mapped);
      } catch (err) {
        console.error("Failed to load certificates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleCopyNumber = (num: string, index: number) => {
    navigator.clipboard.writeText(num);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-xs text-slate-500 font-medium">Fetching certificates ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {certs.map((cert, idx) => (
          <Card key={cert.id} className="border border-slate-200 dark:border-slate-800 bg-card overflow-hidden shadow hover:shadow-md transition relative group">
            {/* Background design elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
            
            <CardHeader className="p-6 pb-4 border-b">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-semibold text-slate-400">Verified Certificate</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <CardTitle className="text-base font-bold mt-4 leading-snug">{cert.courseTitle}</CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">Instructor: {cert.instructor}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Certificate ID:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                    {cert.certNumber}
                    <button onClick={() => handleCopyNumber(cert.certNumber, idx)} className="text-slate-400 hover:text-slate-600">
                      {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Issue Date:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{cert.issueDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href={cert.verificationUrl}>
                  <Button variant="outline" className="w-full text-xs h-9 font-semibold">
                    <Eye className="h-3.5 w-3.5 mr-1" /> View & Verify
                  </Button>
                </Link>
                <Button onClick={() => window.open(`/api/v1/certificates/download/${cert.id}`)} className="text-xs h-9 font-semibold">
                  <Download className="h-3.5 w-3.5 mr-1" /> Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {certs.length === 0 && (
          <div className="p-8 border border-dashed text-center rounded-lg text-xs text-slate-400 sm:col-span-2">
            <Award className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            You have not earned any certificates yet. Complete a course syllabus to generate one.
          </div>
        )}
      </div>

      {/* Info card */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <CardContent className="p-5 flex gap-4 items-start">
          <QrCode className="h-10 w-10 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Secure QR Verification</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every certificate generated by Amit Solution Hub contains a tamper-proof verification QR code and security hash. Employers can verify the authenticity of your credentials instantly via the public validation gateway.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default StudentCertificates;
