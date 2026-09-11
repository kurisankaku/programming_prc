export type Category = "筆記" | "裁断" | "計測" | "収納";

export const categories: Category[] = ["筆記", "裁断", "計測", "収納"];

export type Product = {
  id: string;
  name: string;
  reading: string;
  category: Category;
  price: number;
  material: string;
  size: string;
  inStock: boolean;
  blurb: string;
  featured?: boolean;
};

/** GET /api/products のレスポンス。total は絞り込み前の総数。 */
export type ProductListResponse = {
  items: Product[];
  total: number;
};

export const formatPrice = (price: number) => `¥${price.toLocaleString("ja-JP")}`;
