"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { ProductVariantsPanel } from "@/components/admin/product-variants-panel";
import type { ProductVariantRow } from "@/lib/database.types";

type VariantsOptionContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const VariantsOptionContext = createContext<VariantsOptionContextValue | null>(
  null,
);

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
        Do you want to add variants?
      </legend>
      <p className="mb-2 text-xs text-[var(--muted)]">
        Optional. Use for colors, sizes, etc. (e.g. Black, Silver).
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

export function ProductVariantsPanelSlot({
  productId,
  productStock = 0,
  variants,
  editingVariantId,
}: {
  productId?: string;
  productStock?: number;
  variants: ProductVariantRow[];
  editingVariantId?: string;
}) {
  const { enabled } = useVariantsOption();

  if (!enabled) {
    if (!productId) return null;
    return (
      <p className="mt-3 text-xs text-[var(--muted)]">
        Variants are off for this product. Choose <strong>Yes</strong> above to
        add colors or sizes, then save the product when you are done.
      </p>
    );
  }

  if (!productId) {
    return (
      <p className="mt-3 rounded-md border border-[var(--silver)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted)]">
        Save this product first, then you can add variant options here.
      </p>
    );
  }

  return (
    <ProductVariantsPanel
      key={`${productId}-${editingVariantId || "new"}`}
      productId={productId}
      productStock={productStock}
      variants={variants}
      editingVariantId={editingVariantId}
    />
  );
}
