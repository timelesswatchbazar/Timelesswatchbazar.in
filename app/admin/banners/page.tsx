import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { deleteBanner, requireAdmin, saveBanner } from "@/lib/admin/actions";
import type { BannerRow } from "@/lib/database.types";

type Props = {
  searchParams: Promise<{ edit?: string; error?: string; success?: string; deleted?: string }>;
};

export default async function AdminBannersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: banners } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  const editing = (banners as BannerRow[] | null)?.find((b) => b.id === params.edit);

  return (
    <AdminShell title="Banners">
      {(params.error || params.success || params.deleted) && (
        <p
          className={`mb-4 rounded-md px-3 py-2 text-sm ${
            params.error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
          }`}
        >
          {params.error
            ? decodeURIComponent(params.error)
            : params.deleted
              ? "Banner deleted."
              : "Banner saved."}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="h-fit rounded-lg border border-[var(--silver)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">{editing ? "Edit banner" : "Add banner"}</h2>
          <form action={saveBanner} className="mt-4 space-y-3">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div>
              <label className="mb-1 block text-sm font-semibold">Title</label>
              <input
                name="title"
                defaultValue={editing?.title}
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Subtitle</label>
              <textarea
                name="subtitle"
                rows={2}
                defaultValue={editing?.subtitle}
                className="w-full rounded-md border border-[var(--silver)] px-3 py-2 text-sm"
              />
            </div>
            <ImageUploadField
              name="image_url"
              bucket="banner-images"
              defaultValue={editing?.image_url}
              label="Banner image"
            />
            <div>
              <label className="mb-1 block text-sm font-semibold">Link URL</label>
              <input
                name="link_url"
                defaultValue={editing?.link_url || "/"}
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
              <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
              Active
            </label>
            <button type="submit" className="btn-soft">
              {editing ? "Update banner" : "Add banner"}
            </button>
            {editing && (
              <Link href="/admin/banners" className="block text-center text-sm text-[var(--navy)]">
                Cancel edit
              </Link>
            )}
          </form>
        </section>

        <section className="space-y-4">
          {((banners as BannerRow[]) || []).map((banner) => (
            <article
              key={banner.id}
              className="overflow-hidden rounded-lg border border-[var(--silver)] bg-white shadow-sm"
            >
              <div className="relative aspect-[21/9] bg-[var(--surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-bold text-[var(--midnight)]">
                    {banner.title || "Untitled banner"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{banner.subtitle}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Link: {banner.link_url} · Sort {banner.sort_order} ·{" "}
                    {banner.is_active ? "Active" : "Hidden"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/banners?edit=${banner.id}`}
                    className="text-sm font-semibold text-[var(--gold)]"
                  >
                    Edit
                  </Link>
                  <form action={deleteBanner}>
                    <input type="hidden" name="id" value={banner.id} />
                    <button type="submit" className="text-sm font-semibold text-red-600">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
          {!banners?.length && (
            <p className="rounded-lg border border-dashed border-[var(--silver)] bg-white p-8 text-center text-[var(--muted)]">
              No banners yet. Upload one to replace the homepage carousel.
            </p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
