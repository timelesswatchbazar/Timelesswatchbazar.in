"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: 0 | 1 | 2 | 3;
  as?: "div" | "section" | "article";
};

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass =
    delay === 1
      ? "scroll-reveal-delay-1"
      : delay === 2
        ? "scroll-reveal-delay-2"
        : delay === 3
          ? "scroll-reveal-delay-3"
          : "";

  return (
    <Tag
      ref={ref as never}
      className={`scroll-reveal ${visible ? "is-visible" : ""} ${delayClass} ${className}`}
    >
      {children}
    </Tag>
  );
}
