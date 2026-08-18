"use client";

import { useRef, useState, type DragEvent } from "react";
import { uploadImage } from "@/lib/upload";

/** Multi-image uploader for one variation. First image = primary. */
export function MultiImageUploadField({
  images,
  onChange,
  label = "Variation images",
}: {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(fileList: FileList | File[] | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;

    setUploading(true);
    setError("");
    try {
      const next = [...images];
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          setError("Please choose image files only (JPG, PNG, WEBP).");
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          setError("Each image must be under 5 MB.");
          continue;
        }
        const url = await uploadImage(file, "product-images");
        if (url && !next.includes(url)) next.push(url);
      }
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function onDragOverZone(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setDragging(true);
  }

  function onDropZone(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (uploading) return;
    void handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--midnight)]">{label}</label>
      <p className="text-[10px] text-[var(--muted)]">
        First image is primary (variation thumbnail + cart). Drag to reorder.
      </p>

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
        onDragOver={onDragOverZone}
        onDragLeave={() => setDragging(false)}
        onDrop={onDropZone}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-4 text-center transition ${
          dragging
            ? "border-[var(--gold)] bg-[var(--gold)]/10"
            : "border-[var(--silver)] bg-[var(--surface)] hover:border-[var(--gold)]"
        } ${uploading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <p className="text-xs font-semibold text-[var(--midnight)]">
          {uploading ? "Uploading…" : "Upload images (multiple)"}
        </p>
        <p className="mt-0.5 text-[10px] text-[var(--muted)]">JPG, PNG, WEBP · max 5 MB each</p>
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex == null) return;
                move(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`relative h-20 w-20 overflow-hidden rounded-md border-2 bg-[var(--surface)] ${
                index === 0 ? "border-[var(--gold)]" : "border-[var(--silver)]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-0.5 top-0.5 rounded bg-[var(--midnight)]/85 px-1 text-[9px] font-bold text-white">
                  Primary
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-0.5 bg-black/55 p-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="rounded px-1 text-[10px] font-bold text-white disabled:opacity-30"
                  aria-label="Move left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="rounded px-1 text-[10px] font-bold text-red-200"
                  aria-label="Remove image"
                >
                  ✕
                </button>
                <button
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="rounded px-1 text-[10px] font-bold text-white disabled:opacity-30"
                  aria-label="Move right"
                >
                  →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
