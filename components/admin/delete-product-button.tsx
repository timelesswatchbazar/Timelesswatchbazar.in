"use client";

import { deleteProduct } from "@/lib/admin/actions";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={productId} />
      <button type="submit" className="text-sm font-semibold text-red-600">
        Delete
      </button>
    </form>
  );
}
