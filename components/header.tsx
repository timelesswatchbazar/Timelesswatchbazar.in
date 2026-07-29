"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "@/components/cart-context";
import { CartIcon, SearchIcon, UserIcon } from "@/components/icons";
import { categories } from "@/lib/products";

export function Header() {
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className="site-header sticky top-0 z-[100] border-b border-zinc-200 !bg-white">
      {/* Top bar: logo, search, icons */}
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="/"
          className="brand-text shrink-0"
          aria-label="Timeless Watch Bazar home"
        >
          <span className="block text-lg font-extrabold leading-none tracking-tight text-zinc-950 sm:text-xl lg:text-2xl">
            Timeless
          </span>
          <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-950 sm:text-xs">
            Watch Bazar
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 lg:flex">
          <form className="header-search w-full max-w-2xl" role="search" onSubmit={onSearch}>
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
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
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
          <Link className="icon-action relative" aria-label="Open profile" href="/profile">
            <UserIcon />
          </Link>
          <Link className="icon-action relative" aria-label="Open cart" href="/cart">
            <CartIcon />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-zinc-100 px-4 py-3 lg:hidden">
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
      )}

      {/* Desktop nav — matches hmshoponline.com */}
      <div className="hidden border-t border-zinc-100 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-7 px-4 py-3 sm:px-6 lg:px-8">
          <Link className="nav-link" href="/">
            Home
          </Link>

          <div className="group relative py-2">
            <Link className="nav-link flex items-center" href="/categories">
              Categories
            </Link>
            <div className="dropdown-panel invisible absolute left-0 top-full z-[200] w-64 border border-zinc-200 bg-white p-3 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
              <div className="flex flex-col">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-950"
                    href={`/categories/${cat.slug}`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link className="nav-link" href="/about">
            About Us
          </Link>
          <Link className="nav-link" href="/contact">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Mobile Menu — matches hmshoponline.com */}
      <div className="relative border-t border-zinc-100 px-4 py-2 lg:hidden">
        <div className="mx-auto flex max-w-7xl justify-end">
          <details
            className="relative"
            open={menuOpen}
            onToggle={(e) => setMenuOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer list-none rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
              Menu
            </summary>
            <div className="mobile-menu-panel absolute right-0 z-[200] mt-3 w-[min(calc(100vw-2rem),18rem)] border border-zinc-200 bg-white p-4 shadow-xl">
              <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
                <Link className="nav-link" href="/" onClick={closeMenu}>
                  Home
                </Link>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-zinc-950">Categories</span>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      className="text-sm font-medium text-zinc-600"
                      href={`/categories/${cat.slug}`}
                      onClick={closeMenu}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>

                <Link className="nav-link" href="/about" onClick={closeMenu}>
                  About Us
                </Link>
                <Link className="nav-link" href="/contact" onClick={closeMenu}>
                  Contact Us
                </Link>

                <Link
                  className="primary-action inline-flex items-center justify-center gap-2 border border-zinc-200 text-center"
                  href="/cart"
                  onClick={closeMenu}
                >
                  <CartIcon className="h-4 w-4" />
                  Cart{itemCount > 0 ? ` (${itemCount})` : ""}
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
