import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insider Threat Detection | COS720",
  description: "AI-powered behavioural classification — University of Pretoria, 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="ml-56 min-h-screen px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
