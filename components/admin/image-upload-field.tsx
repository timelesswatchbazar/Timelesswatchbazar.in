"use client";

import { useRef, useState, type DragEvent } from "react";
import { uploadImage } from "@/lib/upload";

export function ImageUploadField({
  name,
  defaultValue = "",
  bucket,
  label = "Image",
}: {
  name: string;
  defaultValue?: string;
  bucket: "product-images" | "banner-images";
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

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
      <input type="hidden" name={name} value={url} />

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
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
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
            className="mb-3 h-28 w-28 rounded-md border border-[var(--silver)] object-cover"
          />
        ) : (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--gold)] shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
            </svg>
          </div>
        )}

        <p className="text-sm font-semibold text-[var(--midnight)]">
          {uploading
            ? "Uploading…"
            : dragging
              ? "Drop image to upload"
              : url
                ? "Drop a new image or click to replace"
                : "Drag & drop product image here"}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">JPG, PNG, WEBP · max 5 MB</p>

        <span className="btn-soft mt-3 inline-flex max-w-[11rem] text-sm">
          {uploading ? "Please wait…" : "Choose file"}
        </span>
      </div>

      {url && (
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-[var(--muted)]" title={url}>
            Uploaded
          </p>
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
        </div>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-[var(--navy)]">
          Or paste image URL
        </summary>
        <input
          type="url"
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
