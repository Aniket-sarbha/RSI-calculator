import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { ThemeToggle } from "../components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RSI Analytics Dashboard",
  description: "Real-time RSI and price analytics for crypto tokens",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "RSI Analytics Dashboard",
    description: "Monitor real-time RSI and price movements",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={clsx(geistSans.variable, geistMono.variable, "antialiased min-h-screen bg-[--color-background] text-[--color-foreground]")}>        
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-30 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 glass">
              <div className="mx-auto w-full max-w-7xl px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 shadow ring-2 ring-white/20 flex items-center justify-center text-white font-bold text-sm">RSI</div>
                  <div>
                    <Link href="/" className="font-semibold tracking-tight gradient-text text-lg leading-none">Analytics Dashboard</Link>
                    <p className="text-xs text-[--color-muted-foreground] mt-0.5">Real-time token RSI & price</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <a href="https://github.com" target="_blank" rel="noopener" className="btn btn-outline h-10 px-3 text-xs">GitHub</a>
                </div>
              </div>
            </header>
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
            <footer className="border-t border-[--color-border] mt-8 py-6 text-center text-xs text-[--color-muted-foreground]">
              <p>RSI Calculator Dashboard • Built with Next.js 15, Recharts</p>
              <p className="mt-1">&copy; {new Date().getFullYear()} Real-time analytics</p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
