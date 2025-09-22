"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Github } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30  w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 glass">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 shadow ring-2 ring-white/20 flex items-center justify-center text-white font-bold text-sm">
            RSI
          </div>
          <div>
            <Link href="/" className="font-semibold tracking-tight gradient-text text-lg leading-none">
              Analytics Dashboard
            </Link>
            <p className="text-xs text-[--color-muted-foreground] mt-0.5">
              Real-time token RSI & price
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline h-10 px-3 text-xs focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Project GitHub repository"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}