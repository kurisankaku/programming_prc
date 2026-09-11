"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "店について" },
  { href: "/products", label: "道具" },
  { href: "/about", label: "工房" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2.5">
          <span className="text-xl font-semibold tracking-tight">工具</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-graphite transition-colors group-hover:text-brass">
            Kōgu
          </span>
        </Link>

        <nav aria-label="サイト内" className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-2.5 py-2 text-sm transition-colors sm:px-3 ${
                  isActive ? "text-ink" : "text-graphite hover:text-ink"
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-2 -bottom-px h-px bg-brass transition-transform duration-200 ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
