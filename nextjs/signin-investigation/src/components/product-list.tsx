"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { categories, type Category, type Product } from "@/data/products";

type Filter = Category | "すべて";

const filters: Filter[] = ["すべて", ...categories];

export function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("すべて");
  const [inStockOnly, setInStockOnly] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return products.filter((product) => {
      if (filter !== "すべて" && product.category !== filter) return false;
      if (inStockOnly && !product.inStock) return false;
      if (!needle) return true;

      return [product.name, product.reading, product.material, product.blurb]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [products, query, filter, inStockOnly]);

  const isFiltered = query.trim() !== "" || filter !== "すべて" || inStockOnly;

  const clearFilters = () => {
    setQuery("");
    setFilter("すべて");
    setInStockOnly(false);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-rule py-5">
        <label className="block">
          <span className="sr-only">道具を検索</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="名前・材質で探す（例: 真鍮）"
            className="w-full border border-rule bg-white px-4 py-2.5 text-sm placeholder:text-graphite/70 focus:border-brass focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {filters.map((item) => {
            const isActive = filter === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={isActive}
                className={`border px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-blueprint bg-blueprint text-paper"
                    : "border-rule text-graphite hover:border-brass hover:text-ink"
                }`}
              >
                {item}
              </button>
            );
          })}

          <label className="ml-auto flex cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-graphite">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => setInStockOnly(event.target.checked)}
              className="size-3.5 accent-brass"
            />
            在庫あり
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-graphite">
        <p aria-live="polite">
          {visible.length} / {products.length} 点
        </p>
        {isFiltered && (
          <button type="button" onClick={clearFilters} className="text-brass hover:underline">
            絞り込みを外す
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <li key={product.id} className="flex">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-dashed border-rule px-6 py-16 text-center">
          <p className="text-base font-semibold">その条件に合う道具はありません</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-graphite">
            別の言葉で探すか、分類を「すべて」に戻してみてください。取り寄せの相談も受けています。
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 border border-blueprint bg-blueprint px-4 py-2 text-sm text-paper transition-colors hover:bg-blueprint-deep"
          >
            絞り込みを外す
          </button>
        </div>
      )}
    </div>
  );
}
