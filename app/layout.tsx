export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Agent Surface – Learn English in Dublin",
  description:
    "Agent Surface is a Dublin‑based English language school offering high‑quality general, exam-prep & immersive courses since 2012.",
  keywords: [
    "Agent Surface",
    "English Language School",
    "Dublin",
    "IELTS",
    "Cambridge Exam Prep",
    "English Courses",
    "Study English Ireland",
  ],
  icons: {
    icon: "/assets/images/favicon.ico",
    shortcut: "/assets/images/favicon.ico",
    apple: "/assets/images/placeholder.png",
  },
  alternates: {
    canonical: "https://academicbridge.ie/",
  },
  openGraph: {
    title: "Agent Surface – Learn English in Dublin",
    description:
      "Join Agent Surface in Dublin for immersive English courses, exam prep (IELTS, CAE, FCE), social & cultural programs since 2012.",
    url: "https://academicbridge.ie/",
    siteName: "Agent Surface",
    images: [
      {
        url: "https://academicbridge.ie/wp-content/uploads/2025/05/school-photo.jpg",
        width: 1200,
        height: 630,
        alt: "Agent Surface English School Dublin",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Surface – Learn English in Dublin",
    description:
      "Immersive English courses, exam prep (IELTS, Cambridge), and vibrant cultural activities in Dublin since 2012.",
    images: [
      "https://academicbridge.ie/wp-content/uploads/2025/05/school-photo.jpg",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}
      >
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            {children}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
