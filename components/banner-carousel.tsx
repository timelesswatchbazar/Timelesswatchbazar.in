"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import type { BannerRow } from "@/lib/database.types";

const fallbackBanners: BannerRow[] = [
  {
    id: "1",
    title: "Discover Watches That Define Your Style",
    subtitle: "Curated men's, women's, luxury, and smart watches at amazing prices.",
    image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&q=80",
    link_url: "/products",
    sort_order: 0,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    title: "Premium Timepieces",
    subtitle: "Luxury craftsmanship for every occasion.",
    image_url:
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?auto=format&fit=crop&w=1920&q=80",
    link_url: "/products",
    sort_order: 1,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    title: "Classic Collection",
    subtitle: "Timeless designs, modern prices.",
    image_url:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1920&q=80",
    link_url: "/products",
    sort_order: 2,
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

export function BannerCarousel({ banners = [] }: { banners?: BannerRow[] }) {
  const slides = banners.length > 0 ? banners : fallbackBanners;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let id = 0;
    const start = () => {
      id = window.setInterval(() => {
        setIndex((i) => (i + 1) % slides.length);
      }, 6000);
    };
    const stop = () => window.clearInterval(id);

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [slides.length]);

  return (
    <div className="banner-carousel content-reveal">
      <div
        className="banner-carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((banner, i) => (
          <div key={banner.id} className="banner-carousel-slide">
            <Link href={banner.link_url || "/products"} className="absolute inset-0 block">
              <Image
                src={banner.image_url}
                alt={banner.title || "Banner"}
                fill
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                className="object-cover"
                sizes="100vw"
                quality={75}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight)]/80 via-[var(--navy)]/45 to-[var(--midnight)]/25 sm:bg-gradient-to-r sm:from-[var(--midnight)]/75 sm:via-[var(--navy)]/40 sm:to-transparent" />
              <div className="absolute inset-0 flex items-end px-4 pb-10 sm:items-center sm:px-12 sm:pb-0 lg:px-16">
                <div className="max-w-xl text-white">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold)] sm:text-sm sm:tracking-[0.2em]">
                    Timeless Watch Bazar
                  </p>
                  <p className="mt-2 text-2xl font-bold leading-tight tracking-tight sm:mt-3 sm:text-4xl lg:text-5xl">
                    {banner.title || "Discover Watches That Define Your Style"}
                  </p>
                  {banner.subtitle && (
                    <p className="mt-2 hidden max-w-md text-sm text-[var(--silver)] sm:mt-3 sm:block sm:text-base">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Previous banner"
        className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--midnight)] shadow transition hover:bg-[var(--gold)] sm:left-5 sm:h-10 sm:w-10"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
      >
        <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        type="button"
        aria-label="Next banner"
        className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[var(--midnight)] shadow transition hover:bg-[var(--gold)] sm:right-5 sm:h-10 sm:w-10"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
      >
        <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-4">
        {slides.map((banner, i) => (
          <button
            key={banner.id}
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
