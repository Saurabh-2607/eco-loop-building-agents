import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EcoLoop Building Agents Dashboard",
  description: "Autonomous energy optimization using EnergyPlus and local LLMs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className={cn(inter.className, "h-full bg-zinc-50 dark:bg-zinc-950 flex text-zinc-900 dark:text-zinc-50")}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/40 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
