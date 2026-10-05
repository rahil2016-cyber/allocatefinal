import type { Metadata } from "next";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "JobAllocate — Hire Top Talent & Discover Dream Careers",
  description:
    "JobAllocate is the leading platform connecting job seekers with top employers worldwide. Browse thousands of active job opportunities, apply instantly, and manage recruitment seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col font-sans bg-slate-50 text-slate-900 antialiased selection:bg-[#174A7E] selection:text-white">
        <AppProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
