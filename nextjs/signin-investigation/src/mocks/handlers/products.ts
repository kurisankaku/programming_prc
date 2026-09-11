import { HttpResponse, delay, http } from "msw";
import { products } from "@/data/products";
import type { ProductListResponse } from "@/types/product";

/**
 * 実サーバーの代わりに動くハンドラ。絞り込みはここ（= サーバー側）で行います。
 */
export const productHandlers = [
  http.get("/api/products", async ({ request }) => {
    // ローディング表示を確かめられるよう、わざと遅らせています。
    await delay(300);

    const params = new URL(request.url).searchParams;
    const query = (params.get("q") ?? "").trim().toLowerCase();
    const category = params.get("category");
    const inStockOnly = params.get("inStock") === "true";

    const items = products.filter((product) => {
      if (category && product.category !== category) return false;
      if (inStockOnly && !product.inStock) return false;
      if (!query) return true;

      return [product.name, product.reading, product.material, product.blurb]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return HttpResponse.json<ProductListResponse>({ items, total: products.length });
  }),
];
