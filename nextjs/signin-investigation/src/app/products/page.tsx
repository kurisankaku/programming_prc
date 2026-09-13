import type { Metadata } from "next";
import { ProductList } from "@/components/product-list";

export const metadata: Metadata = {
  title: "道具",
  description: "筆記・裁断・計測・収納。工具 Kōgu が扱う道具の一覧です。",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">Catalogue</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">道具</h1>
        <p className="mt-4 text-base leading-relaxed text-graphite">
          在庫のあるものはその日のうちに発送します。取り寄せ表示のものは、職人の手が空いたぶんだけ入荷します。
        </p>
      </header>

      <div className="mt-12">
        <ProductList />
      </div>
    </div>
  );
}
