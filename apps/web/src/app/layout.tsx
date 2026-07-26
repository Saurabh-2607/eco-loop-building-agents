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
    <html lang="en" className="h-full antialiased">
      <body className={cn(inter.className, "h-full bg-background flex text-foreground")}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {children}
          </main>
        </div>
      </body>
    </html>

  );
}
