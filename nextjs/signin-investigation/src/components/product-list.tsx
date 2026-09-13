"use client";

import useSWR from "swr";
import { ProductCard } from "@/components/product-card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMocksReady } from "@/hooks/use-mocks-ready";
import { toMessage } from "@/lib/api-client";
import {
  buildProductsKey,
  selectIsFiltered,
  useProductFilterStore,
  type CategoryFilter,
} from "@/stores/product-filter-store";
import { categories, type ProductListResponse } from "@/types/product";

const filters: CategoryFilter[] = ["すべて", ...categories];

export function ProductList() {
  // 値ごとに購読して、余計な再描画を避けます。
  const query = useProductFilterStore((state) => state.query);
  const category = useProductFilterStore((state) => state.category);
  const inStockOnly = useProductFilterStore((state) => state.inStockOnly);
  const setQuery = useProductFilterStore((state) => state.setQuery);
  const setCategory = useProductFilterStore((state) => state.setCategory);
  const setInStockOnly = useProductFilterStore((state) => state.setInStockOnly);
  const reset = useProductFilterStore((state) => state.reset);
  const isFiltered = useProductFilterStore(selectIsFiltered);

  const debouncedQuery = useDebouncedValue(query);
  const mocksReady = useMocksReady();

  // 条件が SWR のキーになるので、同じ条件に戻ればキャッシュから即座に描画されます。
  const key = mocksReady
    ? buildProductsKey({ query: debouncedQuery, category, inStockOnly })
    : null;

  const { data, error, isValidating, mutate } = useSWR<ProductListResponse>(key);
  // keepPreviousData により、条件を変えても前の結果を保ったまま取得し直します。
  const isRefreshing = Boolean(data) && isValidating;

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
            const isActive = category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
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
          {error ? "—" : data ? `${data.items.length} / ${data.total} 点` : "読み込み中"}
          {isRefreshing && <span className="ml-2 text-brass">更新中</span>}
        </p>
        {isFiltered && (
          <button type="button" onClick={reset} className="text-brass hover:underline">
            絞り込みを外す
          </button>
        )}
      </div>

      <Results
        data={data}
        error={error}
        isRefreshing={isRefreshing}
        onRetry={() => mutate()}
        onReset={reset}
      />
    </div>
  );
}

function Results({
  data,
  error,
  isRefreshing,
  onRetry,
  onReset,
}: {
  data: ProductListResponse | undefined;
  error: unknown;
  isRefreshing: boolean;
  onRetry: () => void;
  onReset: () => void;
}) {
  if (error) {
    return (
      <Notice title={toMessage(error)} body="通信をやり直すか、しばらく経ってからお試しください。">
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 border border-blueprint bg-blueprint px-4 py-2 text-sm text-paper transition-colors hover:bg-blueprint-deep"
        >
          もう一度取得する
        </button>
      </Notice>
    );
  }

  // 骨組みを出すのは、まだ一度も結果が無いときだけです。
  if (!data) {
    return <Skeleton />;
  }

  if (data.items.length === 0) {
    return (
      <Notice
        title="その条件に合う道具はありません"
        body="別の言葉で探すか、分類を「すべて」に戻してみてください。取り寄せの相談も受けています。"
      >
        <button
          type="button"
          onClick={onReset}
          className="mt-5 border border-blueprint bg-blueprint px-4 py-2 text-sm text-paper transition-colors hover:bg-blueprint-deep"
        >
          絞り込みを外す
        </button>
      </Notice>
    );
  }

  return (
    <ul
      className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
        isRefreshing ? "opacity-40" : "opacity-100"
      }`}
    >
      {data.items.map((product) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

function Skeleton() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index} className="h-80 animate-pulse border border-rule bg-paper-sunk" />
      ))}
    </ul>
  );
}

function Notice({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-rule px-6 py-16 text-center">
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-graphite">{body}</p>
      {children}
    </div>
  );
}
