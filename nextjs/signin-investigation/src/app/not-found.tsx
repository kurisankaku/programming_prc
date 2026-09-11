import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-5 py-28 sm:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">Error 404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        そのページは見当たりません
      </h1>
      <p className="mt-4 text-base leading-relaxed text-graphite">
        住所が変わったか、もともと無いページです。道具の一覧からお探しください。
      </p>
      <Link
        href="/products"
        className="mt-8 border border-blueprint bg-blueprint px-6 py-3 text-sm text-paper transition-colors hover:bg-blueprint-deep"
      >
        道具を見る
      </Link>
    </div>
  );
}
