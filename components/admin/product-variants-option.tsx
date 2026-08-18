"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { ProductVariationsEditor } from "@/components/admin/product-variations-editor";
import type { ProductVariantRow } from "@/lib/database.types";

type VariantsOptionContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const VariantsOptionContext = createContext<VariantsOptionContextValue | null>(null);

function useVariantsOption() {
  const ctx = useContext(VariantsOptionContext);
  if (!ctx) {
    throw new Error("Product variants option components need a provider.");
  }
  return ctx;
}

export function ProductVariantsOptionProvider({
  initialEnabled,
  children,
}: {
  initialEnabled: boolean;
  children: ReactNode;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  return (
    <VariantsOptionContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </VariantsOptionContext.Provider>
  );
}

export function HasVariantsRadios() {
  const { enabled, setEnabled } = useVariantsOption();

  return (
    <fieldset className="rounded-md border border-[var(--silver)] bg-[var(--surface)] p-3">
      <legend className="px-1 text-sm font-semibold text-[var(--midnight)]">
        Do you want to add variations?
      </legend>
      <p className="mb-2 text-xs text-[var(--muted)]">
        Choose Yes to add multiple watch images with their own prices in the same save. Customers
        select a variation by tapping its image.
      </p>
      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="has_variants"
            value="yes"
            defaultChecked={enabled}
            onChange={() => setEnabled(true)}
          />
          Yes
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="has_variants"
            value="no"
            defaultChecked={!enabled}
            onChange={() => setEnabled(false)}
          />
          No
        </label>
      </div>
    </fieldset>
  );
}

export function ProductVariationsSection({
  initialVariants = [],
}: {
  initialVariants?: ProductVariantRow[];
}) {
  const { enabled } = useVariantsOption();
  return <ProductVariationsEditor enabled={enabled} initialVariants={initialVariants} />;
}

/** Parent image/price/stock — hidden when color variations are enabled (sourced from default). */
export function ProductBaseCommerceFields({
  editing,
}: {
  editing?: {
    image_url?: string | null;
    actual_price?: number | null;
    sale_price?: number | null;
    stock?: number | null;
  } | null;
}) {
  const { enabled } = useVariantsOption();

  if (enabled) {
    return (
      <div className="rounded-md border border-dashed border-[var(--silver)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
        <input type="hidden" name="image_url" value={editing?.image_url || ""} />
        <input
          type="hidden"
          name="actual_price"
          value={editing?.actual_price != null ? String(editing.actual_price) : "0"}
        />
        <input
          type="hidden"
          name="sale_price"
          value={editing?.sale_price != null ? String(editing.sale_price) : "0"}
        />
        <input
          type="hidden"
          name="stock"
          value={editing?.stock != null ? String(editing.stock) : "0"}
        />
        Image, price, and stock for listings come from the <strong>default color variation</strong>{" "}
        below.
      </div>
    );
  }

  return (
    <>
      <ImageUploadField
        name="image_url"
        bucket="product-images"
        defaultValue={editing?.image_url || ""}
        label="Product image"
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">Actual price (₹)</label>
          <input
            name="actual_price"
            type="number"
            step="0.01"
            min={0}
            inputMode="decimal"
            required
            defaultValue={editing?.actual_price != null ? String(editing.actual_price) : ""}
            className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Sale price (₹)</label>
          <input
            name="sale_price"
            type="number"
            step="0.01"
            min={0}
            inputMode="decimal"
            required
            defaultValue={editing?.sale_price != null ? String(editing.sale_price) : ""}
            className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Stock</label>
        <input
          name="stock"
          type="number"
          min={0}
          defaultValue={editing?.stock != null ? String(editing.stock) : "0"}
          className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
        />
      </div>
    </>
  );
}
