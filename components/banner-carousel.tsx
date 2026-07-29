"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const banners = [
  {
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80",
    alt: "Luxury watch collection banner",
  },
  {
    src: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1920&q=80",
    alt: "Premium timepieces banner",
  },
  {
    src: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1920&q=80",
    alt: "Classic watches banner",
  },
];

export function BannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="banner-carousel content-reveal">
      <div
        className="banner-carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.src} className="banner-carousel-slide">
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)]/80 via-[var(--navy)]/45 to-[var(--midnight)]/25 sm:bg-gradient-to-r sm:from-[var(--midnight)]/75 sm:via-[var(--navy)]/40 sm:to-transparent" />
            <div className="absolute inset-0 flex items-end px-4 pb-10 sm:items-center sm:px-12 sm:pb-0 lg:px-16">
              <div className="max-w-xl text-white">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold)] sm:text-sm sm:tracking-[0.2em]">
                  Timeless Watch Bazar
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:mt-3 sm:text-4xl lg:text-5xl">
                  Discover Watches That Define Your Style
                </h2>
                <p className="mt-2 hidden max-w-md text-sm text-[var(--silver)] sm:mt-3 sm:block sm:text-base">
                  Curated men&apos;s, women&apos;s, luxury, and smart watches at amazing prices.
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Previous banner"
        className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--midnight)] shadow transition hover:bg-[var(--gold)] sm:left-5 sm:h-10 sm:w-10"
        onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
      >
        <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        type="button"
        aria-label="Next banner"
        className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--midnight)] shadow transition hover:bg-[var(--gold)] sm:right-5 sm:h-10 sm:w-10"
        onClick={() => setIndex((i) => (i + 1) % banners.length)}
      >
        <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-4">
        {banners.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition sm:h-2.5 sm:w-2.5 ${
              i === index ? "bg-[var(--gold)]" : "bg-white/50"
            }`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
