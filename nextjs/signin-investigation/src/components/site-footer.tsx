import Link from "next/link";

/** 全ページ共通のフッター。 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rule bg-paper-sunk">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-[1fr_auto] sm:px-8">
        <div>
          <p className="text-lg font-semibold tracking-tight">工具 Kōgu</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-graphite">
            京都・西陣の道具屋です。作り手の分かる道具だけを、直してでも長く使える形で扱っています。
          </p>
        </div>

        <nav aria-label="フッター" className="flex flex-col gap-2 text-sm sm:text-right">
          <Link href="/" className="text-graphite hover:text-ink">
            店について
          </Link>
          <Link href="/products" className="text-graphite hover:text-ink">
            道具
          </Link>
          <Link href="/about" className="text-graphite hover:text-ink">
            工房
          </Link>
        </nav>
      </div>

      <div className="border-t border-rule">
        <p className="mx-auto max-w-6xl px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-graphite sm:px-8">
          © 2026 Kōgu — Sample project. Next.js 16 / React 19 / Tailwind CSS 4
        </p>
      </div>
    </footer>
  );
}
