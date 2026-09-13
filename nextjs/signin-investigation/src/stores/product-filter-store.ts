import { create } from "zustand";
import type { Category } from "@/types/product";

export type CategoryFilter = Category | "すべて";

type ProductFilterState = {
  query: string;
  category: CategoryFilter;
  inStockOnly: boolean;
  setQuery: (query: string) => void;
  setCategory: (category: CategoryFilter) => void;
  setInStockOnly: (inStockOnly: boolean) => void;
  reset: () => void;
};

const initialFilters = {
  query: "",
  category: "すべて" as CategoryFilter,
  inStockOnly: false,
};

/** 一覧の絞り込み条件。この状態から SWR のキーを組み立てる。 */
export const useProductFilterStore = create<ProductFilterState>()((set) => ({
  ...initialFilters,
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly }),
  reset: () => set(initialFilters),
}));

/** 何か絞り込んでいるか。 */
export const selectIsFiltered = (state: ProductFilterState) =>
  state.query.trim() !== "" || state.category !== "すべて" || state.inStockOnly;

/** 絞り込み条件を API のクエリ文字列に変換する。 */
export function buildProductsKey(filters: {
  query: string;
  category: CategoryFilter;
  inStockOnly: boolean;
}) {
  const params = new URLSearchParams();
  const query = filters.query.trim();

  if (query) params.set("q", query);
  if (filters.category !== "すべて") params.set("category", filters.category);
  if (filters.inStockOnly) params.set("inStock", "true");

  const search = params.toString();
  return search ? `/products?${search}` : "/products";
}
