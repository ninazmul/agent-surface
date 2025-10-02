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
  title: "Agent Surface – University, Agent & Student CRM Dashboard",
  description:
    "Agent Surface is a powerful CRM dashboard designed for universities, agents, and students to streamline applications, communication, and management in one platform.",
  keywords: [
    "Agent Surface",
    "University CRM",
    "Education Agents",
    "Student Management",
    "Admissions Dashboard",
    "Agent Portal",
    "Student Recruitment",
  ],
  icons: {
    icon: "/assets/images/favicon.ico",
    shortcut: "/assets/images/favicon.ico",
    apple: "/assets/images/placeholder.png",
  },
  alternates: {
    canonical: "https://agentsurface.com/",
  },
  openGraph: {
    title: "Agent Surface – University, Agent & Student CRM Dashboard",
    description:
      "Manage student recruitment, agent partnerships, and university admissions in one seamless CRM dashboard with Agent Surface.",
    url: "https://agentsurface.com/",
    siteName: "Agent Surface",
    images: [
      {
        url: "https://agentsurface.com/assets/images/dashboard-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Agent Surface CRM Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Surface – University, Agent & Student CRM Dashboard",
    description:
      "A modern CRM platform for universities, agents, and students to simplify applications, recruitment, and collaboration.",
    images: [
      "https://agentsurface.com/assets/images/dashboard-preview.jpg",
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
