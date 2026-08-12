"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteProduct } from "@/lib/admin/actions";

function ConfirmDeleteActions({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={onCancel}
        className="rounded-md border border-[var(--silver)] px-4 py-2 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--surface)]"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Yes, delete product"}
      </button>
    </div>
  );
}

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-red-600 hover:underline"
      >
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <form
            ref={formRef}
            action={deleteProduct}
            className="w-full max-w-md rounded-xl border border-red-200 bg-white p-5 shadow-xl"
          >
            <input type="hidden" name="id" value={productId} />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
              Warning
            </p>
            <h2
              id="delete-product-title"
              className="mt-2 text-lg font-bold text-[var(--midnight)]"
            >
              Delete this product?
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              You are about to permanently delete{" "}
              <strong className="text-[var(--midnight)]">{productName}</strong>.
              This cannot be undone.
            </p>
            <ConfirmDeleteActions onCancel={() => setOpen(false)} />
          </form>
        </div>
      )}
    </>
  );
}
