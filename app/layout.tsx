import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk, Space_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Trinetra | All-in-one Deepfake Detection",
  description:
    "Trinetra helps organizations detect manipulated media with high accuracy, real-time analysis, and enterprise-grade security.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", manrope.variable, spaceGrotesk.variable, spaceMono.variable, "font-sans", geist.variable)}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
