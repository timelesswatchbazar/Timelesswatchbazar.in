import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { deleteCategory, requireAdmin, saveCategory } from "@/lib/admin/actions";
import type { CategoryRow } from "@/lib/database.types";

type Props = {
  searchParams: Promise<{ edit?: string; error?: string; success?: string; deleted?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");

  const editing = (categories as CategoryRow[] | null)?.find((c) => c.id === params.edit);

  return (
    <AdminShell title="Categories">
      {(params.error || params.success || params.deleted) && (
        <p
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            params.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {params.error
            ? decodeURIComponent(params.error)
            : params.deleted
              ? "Category deleted."
              : "Category saved."}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <section className="h-fit rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">
            {editing ? "Edit category" : "Add category"}
          </h2>
          <form action={saveCategory} className="mt-4 space-y-3">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div>
              <label className="mb-1 block text-sm font-semibold">Name</label>
              <input
                name="name"
                required
                defaultValue={editing?.name}
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Slug</label>
              <input
                name="slug"
                placeholder="auto-from-name"
                defaultValue={editing?.slug}
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              />
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
            <div>
              <label className="mb-1 block text-sm font-semibold">Sort order</label>
              <input
                name="sort_order"
                type="number"
                defaultValue={editing ? String(editing.sort_order) : "0"}
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={editing?.is_active ?? true}
              />
              Active
            </label>
            <button type="submit" className="btn-soft">
              {editing ? "Update" : "Add category"}
            </button>
            {editing && (
              <Link
                href="/admin/categories"
                className="block text-center text-sm text-[var(--navy)]"
              >
                Cancel edit
              </Link>
            )}
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-[var(--silver)] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {((categories as CategoryRow[]) || []).map((category) => (
                <tr key={category.id} className="border-t border-[var(--silver)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-[var(--muted)] line-clamp-1">
                      {category.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{category.slug}</td>
                  <td className="px-4 py-3">
                    {category.is_active ? "Active" : "Hidden"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/categories?edit=${category.id}`}
                        className="font-semibold text-[var(--gold)]"
                      >
                        Edit
                      </Link>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={category.id} />
                        <button type="submit" className="font-semibold text-red-600">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AdminShell>
  );
}
