"use client";

import { useRef, useState, type DragEvent } from "react";
import { uploadImage } from "@/lib/upload";

export function ImageUploadField({
  name,
  defaultValue = "",
  value,
  onChange,
  bucket,
  label = "Image",
  compact = false,
}: {
  name?: string;
  defaultValue?: string;
  /** Controlled value — when set with onChange, field is controlled. */
  value?: string;
  onChange?: (url: string) => void;
  bucket: "product-images" | "banner-images";
  label?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined && typeof onChange === "function";
  const [internalUrl, setInternalUrl] = useState(defaultValue);
  const url = isControlled ? value : internalUrl;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  function setUrl(next: string) {
    if (isControlled) onChange?.(next);
    else setInternalUrl(next);
  }

  async function handleFile(file: File | undefined | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, WEBP, etc.).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const publicUrl = await uploadImage(file, bucket);
      setUrl(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setDragging(true);
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (uploading) return;
    void handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--midnight)]">{label}</label>
      {name ? <input type="hidden" name={name} value={url} /> : null}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!uploading) inputRef.current?.click();
          }
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition ${
          compact ? "px-3 py-4" : "px-4 py-6"
        } ${
          dragging
            ? "border-[var(--gold)] bg-[var(--gold)]/10"
            : "border-[var(--silver)] bg-[var(--surface)] hover:border-[var(--gold)] hover:bg-white"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Preview"
            className={`mb-2 rounded-md border border-[var(--silver)] object-cover ${
              compact ? "h-20 w-20" : "h-28 w-28"
            }`}
          />
        ) : (
          <div
            className={`mb-2 flex items-center justify-center rounded-full bg-white text-[var(--gold)] shadow-sm ${
              compact ? "h-10 w-10" : "h-12 w-12"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
            </svg>
          </div>
        )}

        <p className="text-xs font-semibold text-[var(--midnight)] sm:text-sm">
          {uploading
            ? "Uploading…"
            : dragging
              ? "Drop image to upload"
              : url
                ? "Replace image"
                : "Upload image"}
        </p>
        {!compact && (
          <p className="mt-1 text-xs text-[var(--muted)]">JPG, PNG, WEBP · max 5 MB</p>
        )}
      </div>

      {url && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => {
            setUrl("");
            setError("");
          }}
          className="text-xs font-semibold text-red-600 hover:underline"
        >
          Remove image
        </button>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-[var(--navy)]">
          Or paste image URL
        </summary>
        <input
          type="text"
          inputMode="url"
          autoComplete="off"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="mt-2 w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
        />
      </details>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
