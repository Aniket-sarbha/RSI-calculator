import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-[--color-border] mt-8 py-6 text-center text-xs text-[--color-muted-foreground]">
      <p>RSI Calculator Dashboard • Built with Next.js 15, Recharts</p>
      <p className="mt-1">&copy; {new Date().getFullYear()} Real-time analytics</p>
    </footer>
  );
}