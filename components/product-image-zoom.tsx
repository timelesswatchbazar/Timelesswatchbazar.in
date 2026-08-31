"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const ZOOM_SCALE = 2.4;

export function ProductImageZoom({
  src,
  alt,
  unoptimized = false,
}: {
  src: string;
  alt: string;
  unoptimized?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxOrigin, setLightboxOrigin] = useState({ x: 50, y: 50 });
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  const updateOrigin = useCallback((clientX: number, clientY: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setOrigin({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        setLightboxZoomed(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    setHovering(false);
    setLightboxZoomed(false);
  }, [src]);

  return (
    <>
      <div
        ref={frameRef}
        className="group relative mx-auto flex aspect-square max-h-[min(52vh,420px)] w-full max-w-md cursor-zoom-in items-center justify-center overflow-hidden rounded-md border border-[var(--silver)] bg-[var(--surface)] sm:max-h-[min(56vh,460px)] lg:max-h-[480px] lg:max-w-none"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={(e) => {
          if (!frameRef.current) return;
          updateOrigin(e.clientX, e.clientY, frameRef.current);
        }}
        onClick={() => {
          setLightboxOpen(true);
          setLightboxZoomed(false);
          setLightboxOrigin({ x: 50, y: 50 });
        }}
        role="button"
        tabIndex={0}
        aria-label="Zoom product image"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setLightboxOpen(true);
            setLightboxZoomed(false);
          }
        }}
      >
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority
          className="object-contain p-3 transition-transform duration-150 ease-out sm:p-4"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px"
          unoptimized={unoptimized}
          style={
            hovering
              ? {
                  transform: `scale(${ZOOM_SCALE})`,
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                  cursor: "zoom-in",
                }
              : { cursor: "zoom-in" }
          }
        />

        <button
          type="button"
          aria-label="Open zoomed product image"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
            setLightboxZoomed(false);
            setLightboxOrigin({ x: 50, y: 50 });
          }}
          className="absolute bottom-3 left-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--silver)] bg-white/95 text-[var(--midnight)] shadow-sm transition hover:border-[var(--gold)] hover:bg-white"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16.5 16.5L21 21" strokeLinecap="round" />
            <path d="M11 8.5v5M8.5 11h5" strokeLinecap="round" />
          </svg>
        </button>

        <p className="pointer-events-none absolute bottom-3 right-3 hidden rounded bg-[var(--midnight)]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100 sm:block">
          Hover to zoom · Click for full view
        </p>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
          onClick={() => {
            setLightboxOpen(false);
            setLightboxZoomed(false);
          }}
        >
          <button
            type="button"
            aria-label="Close zoom"
            className="absolute right-4 top-4 z-[210] rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-sm font-semibold text-white hover:bg-black/70"
            onClick={() => {
              setLightboxOpen(false);
              setLightboxZoomed(false);
            }}
          >
            Close
          </button>

          <div
            className="relative h-[min(88vh,900px)] w-full max-w-5xl overflow-hidden rounded-md bg-black/20"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={(e) => {
              if (!lightboxZoomed) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setLightboxOrigin({
                x: Math.min(100, Math.max(0, x)),
                y: Math.min(100, Math.max(0, y)),
              });
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain transition-transform duration-150 ease-out"
              sizes="100vw"
              unoptimized={unoptimized}
              style={
                lightboxZoomed
                  ? {
                      transform: `scale(${ZOOM_SCALE})`,
                      transformOrigin: `${lightboxOrigin.x}% ${lightboxOrigin.y}%`,
                      cursor: "zoom-out",
                    }
                  : { cursor: "zoom-in" }
              }
              onClick={() => setLightboxZoomed((z) => !z)}
            />
            <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/60 px-3 py-1 text-xs font-medium text-white">
              {lightboxZoomed ? "Click to zoom out · Move to pan" : "Click image to zoom in"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
