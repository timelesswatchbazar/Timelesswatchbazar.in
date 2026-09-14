"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SearchIcon, UserIcon } from "@/components/icons";
import { categories as localCategories } from "@/lib/products";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
] as const;

export function Header({ categories = localCategories }: { categories?: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const whatsappHref = generalWhatsAppUrl();

  useEffect(() => {
    setMobileSearchOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/products");
    setMobileSearchOpen(false);
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header sticky top-0 z-[100] border-b border-[var(--silver)] !bg-white">
      {/* Top bar: brand · search · actions */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="brand-text shrink-0"
          aria-label="Timeless Watch Bazar home"
        >
          <span className="block text-lg font-extrabold leading-none tracking-tight text-[var(--midnight)] sm:text-xl lg:text-2xl">
            Timeless
          </span>
          <span className="mt-0.5 block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold)] sm:text-xs">
            Watch Bazar
          </span>
        </Link>

        <form
          className="header-search mx-auto hidden w-full max-w-md flex-1 lg:flex xl:max-w-lg"
          role="search"
          onSubmit={onSearch}
        >
          <input
            placeholder="Search products"
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            className="icon-action lg:hidden"
            aria-label="Open search"
            aria-expanded={mobileSearchOpen}
            onClick={() => {
              setMobileSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <Link className="icon-action" aria-label="Open profile" href="/profile">
            <UserIcon />
          </Link>
        </div>
      </div>

      {mobileSearchOpen ? (
        <div className="border-t border-[var(--silver)] px-4 py-3 lg:hidden">
          <form className="header-search w-full" role="search" onSubmit={onSearch}>
            <input
              placeholder="Search products"
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" aria-label="Search">
              <SearchIcon />
            </button>
          </form>
        </div>
      ) : null}

      {/* Nav row */}
      <div className="border-t border-[var(--silver)] bg-[var(--surface)]/60">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <nav
            className="hidden w-full items-center justify-start gap-1 py-1 lg:flex"
            aria-label="Main"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex w-full items-center justify-between py-2.5 lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              Menu
            </p>
            <details
              className="relative"
              open={menuOpen}
              onToggle={(e) => setMenuOpen((e.target as HTMLDetailsElement).open)}
            >
              <summary className="cursor-pointer list-none rounded-md border border-[var(--silver)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--navy)] [&::-webkit-details-marker]:hidden">
                Browse
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-md border border-[var(--silver)] bg-white p-2 shadow-lg">
                <nav className="flex flex-col">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      className="rounded-md px-3 py-2.5 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--surface)]"
                      href={link.href}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="my-2 border-t border-[var(--silver)] pt-2">
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Categories
                    </p>
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        className="block rounded-md px-3 py-2 text-sm text-[var(--navy)] hover:bg-[var(--surface)]"
                        href={`/categories/${cat.slug}`}
                        onClick={closeMenu}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>

                  <a
                    className="btn-soft mt-1 text-center text-sm"
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                  >
                    Chat on WhatsApp
                  </a>
                </nav>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
