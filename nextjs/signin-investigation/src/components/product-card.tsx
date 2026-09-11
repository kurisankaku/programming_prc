import { formatPrice, type Product } from "@/types/product";

/**
 * The card is laid out as a datasheet: a drafting panel on top,
 * then the rows a workshop would actually record.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex w-full flex-col border border-rule bg-white transition-colors hover:border-brass/60">
      <div className="blueprint-grid-ink relative flex h-40 items-center justify-center bg-paper-sunk">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-blueprint/55">
          {product.reading}
        </span>
        <span className="absolute left-3 top-3 font-mono text-[10px] tracking-widest text-brass">
          {product.id.toUpperCase()}
        </span>
        {!product.inStock && (
          <span className="absolute right-3 top-3 border border-graphite/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-graphite">
            取り寄せ
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{product.name}</h3>
          <p className="shrink-0 font-mono text-sm">{formatPrice(product.price)}</p>
        </div>

        <p className="flex-1 text-sm leading-relaxed text-graphite">{product.blurb}</p>

        <dl className="mt-1 border-t border-rule pt-3 font-mono text-[11px] text-graphite">
          <div className="flex justify-between gap-4 py-0.5">
            <dt className="uppercase tracking-widest">材質</dt>
            <dd className="text-right text-ink">{product.material}</dd>
          </div>
          <div className="flex justify-between gap-4 py-0.5">
            <dt className="uppercase tracking-widest">寸法</dt>
            <dd className="text-right text-ink">{product.size}</dd>
          </div>
          <div className="flex justify-between gap-4 py-0.5">
            <dt className="uppercase tracking-widest">分類</dt>
            <dd className="text-right text-ink">{product.category}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
