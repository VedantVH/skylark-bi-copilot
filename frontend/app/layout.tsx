import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skylark BI Copilot — Enterprise Business Intelligence",
  description: "AI-powered Business Intelligence Platform for Monday.com CRM data. Real-time pipeline analytics, work order tracking, executive briefings, and conversational AI insights powered by Google Gemini.",
  keywords: "business intelligence, AI copilot, monday.com, CRM analytics, pipeline management, executive dashboard",
  authors: [{ name: "Skylark Drones" }],
  openGraph: {
    title: "Skylark BI Copilot",
    description: "Enterprise AI Business Intelligence Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
