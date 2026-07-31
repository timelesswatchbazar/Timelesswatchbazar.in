"use client";

import { useState } from "react";
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
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[var(--midnight)]">{label}</label>
      <input type="hidden" name={name} value={url} />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://... or upload below"
        className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
      />
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          setError("");
          try {
            const publicUrl = await uploadImage(file, bucket);
            setUrl(publicUrl);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setUploading(false);
          }
        }}
        className="block w-full text-sm text-[var(--navy)]"
      />
      {uploading && <p className="text-xs text-[var(--navy)]">Uploading…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Preview"
          className="mt-2 h-28 w-28 rounded-md border border-[var(--silver)] object-cover"
        />
      )}
    </div>
  );
}
