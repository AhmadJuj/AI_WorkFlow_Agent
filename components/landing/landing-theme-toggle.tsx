"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      className="relative size-9 rounded-full"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
    >
      <SunIcon className={cn("absolute size-4 transition-transform", isDark ? "scale-100" : "scale-0")} />
      <MoonIcon className={cn("absolute size-4 transition-transform", isDark ? "scale-0" : "scale-100")} />
    </Button>
  );
}
