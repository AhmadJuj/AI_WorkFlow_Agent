"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: string;
  className?: string;
};

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(value);
  const [isVisible, setIsVisible] = useState(false);
  const widthCh = value.length;

  // Parse once per value to keep effect dependencies stable.
  const parsedValue = useMemo(() => {
    const match = value.match(/^([\d.]+)(.*)$/);
    if (!match) {
      return { hasNumeric: false, targetNum: 0, suffix: value };
    }

    return {
      hasNumeric: true,
      targetNum: parseFloat(match[1]),
      suffix: match[2],
    };
  }, [value]);

  const { hasNumeric, targetNum, suffix } = parsedValue;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !hasNumeric) return;

    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = targetNum * eased;

      if (targetNum % 1 !== 0) {
        setDisplayed(currentVal.toFixed(1) + suffix);
      } else {
        setDisplayed(Math.round(currentVal) + suffix);
      }

      if (current >= steps) {
        clearInterval(timer);
        setDisplayed(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, hasNumeric, value, targetNum, suffix]);

  return (
    <span
      ref={ref}
      className={`inline-block whitespace-nowrap tabular-nums ${className}`}
      style={{ minWidth: `${widthCh}ch` }}
    >
      {displayed}
    </span>
  );
}
