import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/context/theme-provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Amit Solution Hub LMS",
    template: "%s | Amit Solution Hub LMS"
  },
  description:
    "Production-ready learning management platform for courses, internships, certificates, analytics, payments, and realtime collaboration.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Amit Solution Hub LMS",
    description: "Career-focused LMS for learners, mentors, admins, and HR teams.",
    images: ["/images/ash-lms-hero.png"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
