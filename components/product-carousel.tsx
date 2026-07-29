"use client";

import Link from "next/link";
import { useRef } from "react";
import { ProductCard } from "@/components/product-card";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import type { Product } from "@/lib/types";

export function ProductCarousel({
  title,
  products,
  href,
  linkLabel = "View Category",
}: {
  title: string;
  products: Product[];
  href: string;
  linkLabel?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.85, 320), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <ScrollReveal as="section" className="mt-8 sm:mt-14">
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5 sm:items-end sm:gap-4">
        <h2 className="min-w-0 flex-1 text-xl font-bold tracking-tight text-[var(--midnight)] sm:text-3xl">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="Scroll products left"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--silver)] text-[var(--navy)] transition hover:border-[var(--midnight)] hover:bg-[var(--midnight)] hover:text-white sm:h-9 sm:w-9"
            onClick={() => scroll(-1)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll products right"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--silver)] text-[var(--navy)] transition hover:border-[var(--midnight)] hover:bg-[var(--midnight)] hover:text-white sm:h-9 sm:w-9"
            onClick={() => scroll(1)}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <Link
            href={href}
            className="ml-1 hidden text-sm font-bold text-[var(--gold)] transition hover:text-[var(--gold-hover)] sm:inline"
          >
            {linkLabel}
          </Link>
        </div>
      </div>
      <div
        ref={scrollerRef}
        className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:gap-4 sm:px-0"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[42vw] max-w-[200px] shrink-0 snap-start sm:w-[240px] sm:max-w-none lg:w-[260px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <Link
        href={href}
        className="mt-3 inline-block text-sm font-bold text-[var(--gold)] sm:hidden"
      >
        {linkLabel}
      </Link>
    </ScrollReveal>
  );
}
