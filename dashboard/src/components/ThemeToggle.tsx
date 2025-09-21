"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  
  React.useEffect(() => setMounted(true), []);
  
  if (!mounted) return (
    <button aria-label="Toggle theme" className="btn btn-ghost w-12 h-12 justify-center" />
  );
  
  const isDark = theme === "dark";
  
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn btn-ghost w-12 h-12 justify-center"
    >
      {isDark ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
    </button>
  );
}