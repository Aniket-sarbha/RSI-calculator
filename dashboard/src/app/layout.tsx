import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import React from "react";
import clsx from "clsx";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

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
            <Navbar />
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
