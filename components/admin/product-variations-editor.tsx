"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MultiImageUploadField } from "@/components/admin/multi-image-upload-field";
import type { ProductVariantRow } from "@/lib/database.types";

export type DraftVariant = {
  key: string;
  id?: string;
  color_name: string;
  color_hex: string;
  actual_price: string;
  sale_price: string;
  /** Ordered images; first = primary */
  images: string[];
  stock: string;
  sort_order: string;
  is_default: boolean;
  is_active: boolean;
};

function newKey() {
  return `v_${Math.random().toString(36).slice(2, 10)}`;
}

function blankVariant(isDefault = false, sortOrder = 0): DraftVariant {
  return {
    key: newKey(),
    color_name: "",
    color_hex: "#C7A252",
    actual_price: "",
    sale_price: "",
    images: [],
    stock: "0",
    sort_order: String(sortOrder),
    is_default: isDefault,
    is_active: true,
  };
}

function rowImages(row: ProductVariantRow): string[] {
  const primary = (row.image_url || "").trim();
  const extras = Array.isArray(row.gallery)
    ? row.gallery.map((g) => String(g || "").trim()).filter(Boolean)
    : [];
  const out: string[] = [];
  for (const url of [primary, ...extras]) {
    if (url && !out.includes(url)) out.push(url);
  }
  return out;
}

function fromRows(rows: ProductVariantRow[]): DraftVariant[] {
  if (!rows.length) return [blankVariant(true, 0)];
  const hasDefault = rows.some((r) => r.is_default);
  return rows.map((row, index) => ({
    key: row.id,
    id: row.id,
    color_name: row.color_name || "",
    color_hex: row.color_hex || "#C7A252",
    actual_price: row.actual_price != null ? String(row.actual_price) : "",
    sale_price: row.sale_price != null ? String(row.sale_price) : "",
    images: rowImages(row),
    stock: String(row.stock ?? 0),
    sort_order: String(row.sort_order ?? index),
    is_default: hasDefault ? Boolean(row.is_default) : index === 0,
    is_active: row.is_active ?? true,
  }));
}

export function ProductVariationsEditor({
  enabled,
  initialVariants = [],
}: {
  enabled: boolean;
  initialVariants?: ProductVariantRow[];
}) {
  const [variants, setVariants] = useState<DraftVariant[]>(() =>
    enabled ? fromRows(initialVariants) : [],
  );
  const [validationError, setValidationError] = useState("");
  const seededRef = useRef(false);

  useEffect(() => {
    if (enabled) {
      if (!seededRef.current || variants.length === 0) {
        setVariants(fromRows(initialVariants));
        seededRef.current = true;
      }
    } else {
      seededRef.current = false;
      setValidationError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const jsonPayload = useMemo(() => {
    if (!enabled) return "[]";
    return JSON.stringify(
      variants.map((v, index) => {
        const images = v.images.map((u) => u.trim()).filter(Boolean);
        return {
          id: v.id || null,
          color_name: v.color_name.trim(),
          color_hex: v.color_hex.trim() || "#C7A252",
          actual_price: v.actual_price.trim(),
          sale_price: v.sale_price.trim(),
          image_url: images[0] || "",
          gallery: images.slice(1),
          stock: Number(v.stock) || 0,
          sort_order: Number(v.sort_order) || index,
          is_default: Boolean(v.is_default),
          is_active: Boolean(v.is_active),
        };
      }),
    );
  }, [enabled, variants]);

  useEffect(() => {
    if (!enabled) return;
    const form = document.getElementById("admin-product-form") as HTMLFormElement | null;
    if (!form) return;

    const onSubmit = (ev: Event) => {
      const error = validateVariants(variants);
      if (error) {
        ev.preventDefault();
        setValidationError(error);
      }
    };

    form.addEventListener("submit", onSubmit, true);
    return () => form.removeEventListener("submit", onSubmit, true);
  }, [enabled, variants]);

  function updateVariant(key: string, patch: Partial<DraftVariant>) {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.key !== key) {
          if (patch.is_default) return { ...v, is_default: false };
          return v;
        }
        return { ...v, ...patch };
      }),
    );
    setValidationError("");
  }

  function addVariant() {
    setVariants((prev) => {
      const next = [...prev, blankVariant(prev.length === 0, prev.length)];
      if (!next.some((v) => v.is_default) && next[0]) {
        next[0] = { ...next[0], is_default: true };
      }
      return next;
    });
    setValidationError("");
  }

  function removeVariant(key: string) {
    setVariants((prev) => {
      const next = prev.filter((v) => v.key !== key);
      if (next.length && !next.some((v) => v.is_default)) {
        next[0] = { ...next[0], is_default: true };
      }
      return next;
    });
  }

  if (!enabled) {
    return <input type="hidden" name="variants_json" value="[]" />;
  }

  return (
    <div className="space-y-3 rounded-md border border-[var(--silver)] bg-[var(--surface)] p-3 sm:p-4">
      <input type="hidden" name="variants_json" value={jsonPayload} />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[var(--midnight)]">Product variations</h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Each variation can have multiple images and its own price. First image is primary.
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="rounded-md border border-[var(--gold)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--midnight)] hover:bg-[var(--gold)]/15"
        >
          + Add variation
        </button>
      </div>

      {validationError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {validationError}
        </p>
      )}

      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div
            key={variant.key}
            className="rounded-lg border border-[var(--silver)] bg-white p-3 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-[var(--midnight)]">
                Variation {index + 1}
                {variant.is_default ? (
                  <span className="ml-2 rounded bg-[var(--gold)]/25 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--midnight)]">
                    Default
                  </span>
                ) : null}
              </p>
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(variant.key)}
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">Variation name</label>
              <input
                value={variant.color_name}
                onChange={(e) => updateVariant(variant.key, { color_name: e.target.value })}
                placeholder="Black"
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-3">
              <MultiImageUploadField
                images={variant.images}
                onChange={(images) => updateVariant(variant.key, { images })}
                label="Variation images"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold">Actual price (₹)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={variant.actual_price}
                  onChange={(e) => updateVariant(variant.key, { actual_price: e.target.value })}
                  placeholder="5999"
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Sale price (₹)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={variant.sale_price}
                  onChange={(e) => updateVariant(variant.key, { sale_price: e.target.value })}
                  placeholder="4999"
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Stock</label>
                <input
                  type="number"
                  min={0}
                  value={variant.stock}
                  onChange={(e) => updateVariant(variant.key, { stock: e.target.value })}
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">Sort</label>
                <input
                  type="number"
                  value={variant.sort_order}
                  onChange={(e) => updateVariant(variant.key, { sort_order: e.target.value })}
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2 font-medium">
                <input
                  type="radio"
                  name="default_variation_ui"
                  checked={variant.is_default}
                  onChange={() => updateVariant(variant.key, { is_default: true })}
                />
                Make this the default variation
              </label>
              <label className="inline-flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={variant.is_active}
                  onChange={(e) => updateVariant(variant.key, { is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function validateVariants(variants: DraftVariant[]): string | null {
  if (!variants.length) return "Add at least one variation.";

  for (const v of variants) {
    if (!v.color_name.trim()) return "Each variation needs a name.";
    if (!v.images.length || !v.images[0]?.trim()) {
      return `At least one image is required for "${v.color_name.trim() || "unnamed"}".`;
    }
    const actual = Number(v.actual_price);
    const sale = Number(v.sale_price);
    if (!Number.isFinite(actual) || actual < 0 || !Number.isFinite(sale) || sale < 0) {
      return `Enter valid prices for "${v.color_name.trim()}".`;
    }
    if (sale > actual) {
      return `Sale price cannot be higher than actual price for "${v.color_name.trim()}".`;
    }
  }

  const seen = new Set<string>();
  for (const v of variants) {
    const name = v.color_name.trim().toLowerCase();
    if (seen.has(name)) {
      return `A variation named "${v.color_name.trim()}" already exists.`;
    }
    seen.add(name);
  }

  if (!variants.some((v) => v.is_default)) {
    return "Select one default variation.";
  }

  return null;
}
