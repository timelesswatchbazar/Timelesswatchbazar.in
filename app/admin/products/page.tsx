import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import {
  HasVariantsRadios,
  ProductBaseCommerceFields,
  ProductVariantsOptionProvider,
  ProductVariationsSection,
} from "@/components/admin/product-variants-option";
import { AdminSubmitButton } from "@/components/admin/submit-button";
import {
  requireAdmin,
  saveProduct,
  toggleProductFlag,
} from "@/lib/admin/actions";
import { discountPercent } from "@/lib/database.types";
import { formatMoney } from "@/lib/money";
import type { ProductRow, ProductVariantRow } from "@/lib/database.types";

type Props = {
  searchParams: Promise<{
    edit?: string;
    variant?: string;
    error?: string;
    success?: string;
    deleted?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories ( id, name, slug )")
      .order("sort_order")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order"),
  ]);

  const editing = (products as ProductRow[] | null)?.find((p) => p.id === params.edit);

  let variants: ProductVariantRow[] = [];
  if (editing?.id) {
    const { data: variantRows } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", editing.id)
      .order("sort_order")
      .order("color_name");
    variants = (variantRows as ProductVariantRow[]) || [];
  }

  const successMessage =
    params.success === "added"
      ? "Product added successfully."
      : params.success === "updated"
        ? "Product updated successfully."
        : params.success === "variant"
          ? "Color variant saved."
          : params.success === "variant_deleted"
            ? "Color variant deleted."
            : params.deleted
              ? "Product deleted successfully."
              : params.success
                ? "Product saved successfully."
                : "";

  const errorRaw = params.error ? decodeURIComponent(params.error) : "";
  const errorMessage =
    errorRaw === "invalid_product"
      ? "Check name and prices. Sale price cannot be higher than actual price."
      : errorRaw === "variant_price_required"
      ? "Each variant needs its own price (actual and sale)."
      : errorRaw === "variant_name_required"
        ? "Variant name is required."
        : errorRaw === "invalid_variant_price"
          ? "Invalid variant price. Sale price cannot be higher than actual price."
          : errorRaw;

  return (
    <AdminShell title="Products">
      {(params.error || successMessage) && (
        <p
          role="status"
          className={`mb-4 rounded-md px-3 py-2.5 text-sm font-medium ${
            params.error
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {params.error ? errorMessage : successMessage}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,440px)_1fr]">
        <ProductVariantsOptionProvider
          key={editing?.id || "new-product"}
          initialEnabled={Boolean(editing?.has_variants) || variants.length > 0}
        >
          <section className="h-fit rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">
              {editing ? "Edit product" : "Add product"}
            </h2>
            <form id="admin-product-form" action={saveProduct} className="mt-4 space-y-3">
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <Field label="Name" name="name" defaultValue={editing?.name} required />
              <Field
                label="Slug"
                name="slug"
                defaultValue={editing?.slug}
                placeholder="auto-from-name"
              />
              <div>
                <label className="mb-1 block text-sm font-semibold">Category</label>
                <select
                  name="category_id"
                  defaultValue={editing?.category_id ?? ""}
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                >
                  <option value="">Uncategorized</option>
                  {(categories || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editing?.description}
                  className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
                />
              </div>

              <HasVariantsRadios />
              <ProductBaseCommerceFields editing={editing} />
              <ProductVariationsSection initialVariants={variants} />

              <Field
                label="Sort order"
                name="sort_order"
                type="number"
                defaultValue={editing ? String(editing.sort_order) : "0"}
              />
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="is_new_arrival"
                  defaultChecked={editing?.is_new_arrival ?? false}
                />
                New arrival
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="is_best_seller"
                  defaultChecked={editing?.is_best_seller ?? false}
                />
                Best seller
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={editing?.is_active ?? true}
                />
                Active (visible in store)
              </label>

              <AdminSubmitButton
                label={editing ? "Save product" : "Create product"}
                pendingLabel={editing ? "Saving…" : "Creating product…"}
              />
              {editing && (
                <Link
                  href="/admin/products"
                  className="block text-center text-sm text-[var(--navy)]"
                >
                  Cancel edit
                </Link>
              )}
            </form>
          </section>
        </ProductVariantsOptionProvider>

        <section className="overflow-hidden rounded-lg border border-[var(--silver)] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--surface)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Pricing</th>
                  <th className="px-4 py-3 font-semibold">Flags</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {((products as ProductRow[]) || []).map((product) => {
                  const off = discountPercent(
                    Number(product.actual_price),
                    Number(product.sale_price),
                  );
                  return (
                    <tr key={product.id} className="border-t border-[var(--silver)]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image_url || "/vercel.svg"}
                            alt=""
                            className="h-12 w-12 rounded object-cover bg-[var(--surface)]"
                          />
                          <div>
                            <p className="font-semibold text-[var(--midnight)]">{product.name}</p>
                            <p className="text-xs text-[var(--muted)]">
                              {product.categories?.name || "Uncategorized"} · stock{" "}
                              {product.stock}
                              {product.has_variants ? " · colors" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-[var(--navy)]">
                          {formatMoney(Number(product.sale_price))}
                        </p>
                        {off > 0 && (
                          <p className="text-xs text-[var(--muted)]">
                            <span className="line-through">
                              {formatMoney(Number(product.actual_price))}
                            </span>{" "}
                            · {off}% off
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <FlagToggle
                            id={product.id}
                            field="is_new_arrival"
                            label="New"
                            value={product.is_new_arrival}
                          />
                          <FlagToggle
                            id={product.id}
                            field="is_best_seller"
                            label="Best"
                            value={product.is_best_seller}
                          />
                          <FlagToggle
                            id={product.id}
                            field="is_active"
                            label="Active"
                            value={product.is_active}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/admin/products?edit=${product.id}`}
                            className="text-sm font-semibold text-[var(--gold)]"
                          >
                            Edit
                          </Link>
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  step?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        min={type === "number" ? "0" : undefined}
        inputMode={type === "number" ? "decimal" : undefined}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
      />
    </div>
  );
}

function FlagToggle({
  id,
  field,
  label,
  value,
}: {
  id: string;
  field: string;
  label: string;
  value: boolean;
}) {
  return (
    <form action={toggleProductFlag} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={value ? "false" : "true"} />
      <button
        type="submit"
        className={`rounded px-2 py-0.5 text-xs font-bold ${
          value
            ? "bg-[var(--midnight)] text-white"
            : "bg-[var(--surface)] text-[var(--muted)]"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
