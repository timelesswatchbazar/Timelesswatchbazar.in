import Link from "next/link";
import { adminLogout } from "@/lib/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--midnight)]">
      <div className="border-b border-[var(--silver)] bg-[var(--midnight)] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
              Timeless Watch Bazar
            </p>
            <h1 className="text-lg font-bold sm:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-[var(--silver)] hover:text-white">
              View store
            </Link>
            <form action={adminLogout}>
              <button
                type="submit"
                className="rounded-md border border-[var(--gold)] px-3 py-1.5 text-sm font-semibold text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--midnight)]"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[200px_1fr]">
        <aside className="h-fit rounded-lg border border-[var(--silver)] bg-white p-2 shadow-sm sm:p-3">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--surface)] hover:text-[var(--midnight)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
