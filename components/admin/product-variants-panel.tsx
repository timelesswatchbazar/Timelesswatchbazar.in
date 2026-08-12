"use client";

import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { deleteProductVariant, saveProductVariant } from "@/lib/admin/actions";
import type { ProductVariantRow } from "@/lib/database.types";

export function ProductVariantsPanel({
  productId,
  productStock = 0,
  variants,
  editingVariantId,
}: {
  productId: string;
  productStock?: number;
  variants: ProductVariantRow[];
  editingVariantId?: string;
}) {
  const editing = variants.find((v) => v.id === editingVariantId);
  const [hex, setHex] = useState(editing?.color_hex || "#C7A252");

  return (
    <section className="mt-6 rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[var(--midnight)]">Product variants</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Add options like <strong>Black &amp; Silver</strong> or <strong>Black &amp; Gold</strong>.
        Each variant needs its <strong>own price</strong> and can have its own image and stock.
      </p>

      <form action={saveProductVariant} className="mt-4 space-y-3 border-b border-[var(--silver)] pb-5">
        <input type="hidden" name="product_id" value={productId} />
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <input type="hidden" name="color_hex" value={hex} />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">Variant name</label>
            <input
              name="color_name"
              required
              defaultValue={editing?.color_name}
              placeholder="Black & Gold"
              className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Swatch color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border border-[var(--silver)] bg-white"
              />
              <input
                type="text"
                value={hex}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) setHex(value);
                }}
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <ImageUploadField
          key={editing?.id || "new-variant"}
          name="image_url"
          bucket="product-images"
          defaultValue={editing?.image_url}
          label="Variant image"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Stock</label>
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={
                editing ? String(editing.stock) : String(Math.max(0, productStock))
              }
              className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Sort</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={editing ? String(editing.sort_order) : "0"}
              className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Actual price (₹)</label>
            <input
              name="actual_price"
              type="number"
              step="0.01"
              min={0}
              required
              defaultValue={
                editing?.actual_price != null ? String(editing.actual_price) : ""
              }
              placeholder="3299"
              className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Sale price (₹)</label>
            <input
              name="sale_price"
              type="number"
              step="0.01"
              min={0}
              required
              defaultValue={editing?.sale_price != null ? String(editing.sale_price) : ""}
              placeholder="3299"
              className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="is_default" defaultChecked={editing?.is_default ?? false} />
          Default option
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
          Active
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-soft">
            {editing ? "Update variant" : "Add variant"}
          </button>
          {editing && (
            <a
              href={`/admin/products?edit=${productId}`}
              className="text-sm font-semibold text-[var(--navy)]"
            >
              Cancel
            </a>
          )}
        </div>
      </form>

      <div className="mt-4 space-y-3">
        {variants.length === 0 && (
          <p className="text-sm text-[var(--muted)]">No variants yet. Add your first option above.</p>
        )}
        {variants.map((variant) => (
          <div
            key={variant.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--silver)] p-3"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={variant.image_url || "/vercel.svg"}
                alt=""
                className="h-12 w-12 rounded object-cover bg-[var(--surface)]"
              />
              <span
                className="inline-block h-5 w-5 rounded-full border border-[var(--silver)]"
                style={{ backgroundColor: variant.color_hex }}
                title={variant.color_hex}
              />
              <div>
                <p className="font-semibold text-[var(--midnight)]">
                  {variant.color_name}
                  {variant.is_default ? (
                    <span className="ml-2 text-xs font-bold text-[var(--gold)]">Default</span>
                  ) : null}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Stock {variant.stock}
                  {!variant.is_active ? " · Hidden" : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={`/admin/products?edit=${productId}&variant=${variant.id}`}
                className="text-sm font-semibold text-[var(--gold)]"
              >
                Edit
              </a>
              <form
                action={deleteProductVariant}
                onSubmit={(e) => {
                  if (!window.confirm(`Delete variant "${variant.color_name}"?`)) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={variant.id} />
                <input type="hidden" name="product_id" value={productId} />
                <button type="submit" className="text-sm font-semibold text-red-600">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
