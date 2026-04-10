export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "AB Partner Portal – University, Agent & Student CRM Dashboard",
  description:
    "AB Partner Portal is a powerful CRM dashboard designed for universities, agents, and students to streamline applications, communication, and management in one platform.",
  keywords: [
    "AB Partner Portal",
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
    apple: "/assets/images/logo.png",
  },
  alternates: {
    canonical: "https://abpartnerportal.com/",
  },
  openGraph: {
    title: "AB Partner Portal – University, Agent & Student CRM Dashboard",
    description:
      "Manage student recruitment, agent partnerships, and university admissions in one seamless CRM dashboard with AB Partner Portal.",
    url: "https://abpartnerportal.com/",
    siteName: "AB Partner Portal",
    images: [
      {
        url: "https://abpartnerportal.com/assets/images/dashboard-preview.png",
        width: 1200,
        height: 630,
        alt: "AB Partner Portal CRM Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AB Partner Portal – University, Agent & Student CRM Dashboard",
    description:
      "A modern CRM platform for universities, agents, and students to simplify applications, recruitment, and collaboration.",
    images: ["https://abpartnerportal.com/assets/images/dashboard-preview.png"],
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
        className={`${spaceGrotesk.variable} font-sans bg-[hsl(var(--background))] text-[hsl(var(--foreground))]`}
      >
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system">
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
