import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import BottomNavbar from "@/components/layout/BottomNavbar";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EcoLoop Building Agents",
  description: "Autonomous energy optimisation for commercial buildings — EnergyPlus + local LLM control loop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geist.variable,
        geistMono.variable,
        newsreader.variable
      )}
    >
      {/* Set outer body to off-white bg-neutral-50/50 for beautiful backdrop contrast */}
      <body className={cn("h-full bg-neutral-50/50 text-foreground font-sans")}>
        <TooltipProvider>
          {/* Centered Application Shell Wrapper */}
          <div className="h-full w-full flex items-center justify-center">
            <div 
              className="max-w-[1440px] w-full h-full flex flex-col bg-background relative border-x border-neutral-200/80 shadow-sm overflow-hidden"
            >
              {/* Top Header */}
              <Navbar />
              
              {/* Scrollable Main Area (with pb-28 to clear bottom navbar) */}
              <main className="flex-1 overflow-y-auto bg-background p-6 pb-28">
                {children}
              </main>

              {/* Centered Floating Bottom Navbar Dock */}
              <BottomNavbar />
            </div>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
