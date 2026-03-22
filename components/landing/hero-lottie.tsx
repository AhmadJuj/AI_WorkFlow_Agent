"use client";

import { useEffect, useRef, useState } from "react";
import type { AnimationItem } from "lottie-web";

type JsonAnimation = Record<string, unknown>;

export function HeroLottie() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [animationData, setAnimationData] = useState<JsonAnimation | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnimation = async () => {
      try {
        const response = await fetch("/AI%20intelligence.json");
        if (!response.ok) {
          return;
        }

        const data: JsonAnimation = await response.json();
        if (isMounted) {
          setAnimationData(data);
        }
      } catch {
        // Keep a graceful fallback when the animation cannot be loaded.
      }
    };

    void loadAnimation();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!animationData || !containerRef.current) {
      return;
    }

    let animation: AnimationItem | null = null;

    const mountAnimation = async () => {
      const lottie = await import("lottie-web");
      animation = lottie.default.loadAnimation({
        container: containerRef.current as Element,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData,
      });
    };

    void mountAnimation();

    return () => {
      animation?.destroy();
    };
  }, [animationData]);

  if (!animationData) {
    return (
      <div className="flex h-80 w-full items-center justify-center rounded-xl bg-muted/40">
        <p className="text-sm text-muted-foreground">Loading AI animation...</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full rounded-xl bg-background/70 p-2 sm:h-95">
      <div ref={containerRef} className="h-full w-full" aria-label="AI intelligence animation" />
    </div>
  );
}
