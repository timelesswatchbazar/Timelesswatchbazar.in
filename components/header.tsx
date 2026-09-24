"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/icons";
import { categoryHref } from "@/lib/slug";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
] as const;

export function Header({ categories = [] }: { categories?: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const whatsappHref = generalWhatsAppUrl();

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
    setMobileCatsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const categoriesActive = isActive("/categories");

  return (
    <header className="site-header sticky top-0 z-[100] border-b border-[var(--silver)] !bg-white">
      {/* Top bar */}
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="icon-action lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          onClick={() => {
            setMenuOpen((v) => !v);
            setSearchOpen(false);
          }}
        >
          {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>

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

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            className="icon-action"
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            onClick={() => {
              setSearchOpen((v) => !v);
              setMenuOpen(false);
            }}
          >
            {searchOpen ? <CloseIcon className="h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
          </button>
          <Link className="icon-action" aria-label="Open profile" href="/profile">
            <UserIcon />
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-[var(--silver)] px-4 py-3 sm:px-6 lg:px-8">
          <form className="header-search mx-auto w-full max-w-xl" role="search" onSubmit={onSearch}>
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

      {/* Desktop nav */}
      <div className="hidden border-t border-[var(--silver)] bg-[var(--surface)]/60 lg:block">
        <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <nav className="flex w-full items-center justify-start gap-1 py-1" aria-label="Main">
            <Link
              href="/"
              className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}
            >
              Home
            </Link>

            <div className="nav-dropdown group relative">
              <Link
                href="/categories"
                className={`nav-link inline-flex items-center gap-1 ${
                  categoriesActive ? "nav-link-active" : ""
                }`}
                aria-haspopup="true"
              >
                Categories
                <ChevronDownIcon className="h-3.5 w-3.5 opacity-70 transition group-hover:rotate-180" />
              </Link>
              <div className="dropdown-panel invisible absolute left-0 top-full z-50 min-w-[14rem] translate-y-1 pt-1 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="rounded-md border border-[var(--silver)] bg-white py-2 shadow-lg">
                  <Link
                    href="/categories"
                    className="block px-4 py-2.5 text-sm font-semibold text-[var(--midnight)] hover:bg-[var(--surface)]"
                  >
                    All categories
                  </Link>
                  <div className="my-1 border-t border-[var(--silver)]" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={categoryHref(cat)}
                      className={`block px-4 py-2.5 text-sm text-[var(--navy)] hover:bg-[var(--surface)] hover:text-[var(--midnight)] ${
                        pathname === categoryHref(cat)
                          ? "bg-[var(--surface)] font-semibold text-[var(--midnight)]"
                          : ""
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${isActive(link.href) ? "nav-link-active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen ? (
        <div className="lg:hidden" id="mobile-nav-drawer">
          <button
            type="button"
            className="fixed inset-0 z-[110] bg-[var(--midnight)]/40"
            aria-label="Close menu overlay"
            onClick={closeMenu}
          />
          <aside className="mobile-menu-panel fixed left-0 top-0 z-[120] flex h-dvh w-[min(20rem,88vw)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--silver)] px-4 py-3">
              <div>
                <p className="text-base font-extrabold text-[var(--midnight)]">Menu</p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--gold)]">
                  Watch Bazar
                </p>
              </div>
              <button
                type="button"
                className="icon-action"
                aria-label="Close menu"
                onClick={closeMenu}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              <Link
                href="/"
                className="block rounded-md px-3 py-3 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--surface)]"
                onClick={closeMenu}
              >
                Home
              </Link>

              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-semibold text-[var(--navy)] hover:bg-[var(--surface)]"
                aria-expanded={mobileCatsOpen}
                onClick={() => setMobileCatsOpen((v) => !v)}
              >
                Categories
                <ChevronDownIcon
                  className={`h-4 w-4 transition ${mobileCatsOpen ? "rotate-180" : ""}`}
                />
              </button>
              {mobileCatsOpen ? (
                <div className="mb-1 ml-2 border-l border-[var(--silver)] pl-2">
                  <Link
                    href="/categories"
                    className="block rounded-md px-3 py-2.5 text-sm text-[var(--navy)] hover:bg-[var(--surface)]"
                    onClick={closeMenu}
                  >
                    All categories
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={categoryHref(cat)}
                      className="block rounded-md px-3 py-2.5 text-sm text-[var(--navy)] hover:bg-[var(--surface)]"
                      onClick={closeMenu}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              {NAV_LINKS.filter((l) => l.href !== "/").map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-md px-3 py-3 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--surface)]"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/track-order"
                className="block rounded-md px-3 py-3 text-sm font-semibold text-[var(--navy)] hover:bg-[var(--surface)]"
                onClick={closeMenu}
              >
                Track Order
              </Link>
            </nav>

            <div className="border-t border-[var(--silver)] p-4">
              <a
                className="btn-soft block w-full text-center text-sm"
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                Chat on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
