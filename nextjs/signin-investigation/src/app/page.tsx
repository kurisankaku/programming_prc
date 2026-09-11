import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { featuredProducts } from "@/data/products";

const promises = [
  {
    label: "Repair",
    title: "直して使う",
    body: "扱う道具はすべて研ぎ直し・修理を受けます。買い替えではなく、手入れで長く使える道具だけを選んでいます。",
  },
  {
    label: "Origin",
    title: "作り手が分かる",
    body: "どの工房の誰が作ったかを言えるものだけを置いています。産地も工程も、聞かれたら答えられます。",
  },
  {
    label: "Fit",
    title: "手に合わせて選ぶ",
    body: "店頭では実際に握って、切って、書いてから決められます。通販でも用途を伺って寸法を提案します。",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="blueprint-grid bg-blueprint text-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">
            Kyoto Nishijin — Est. 2014
          </p>

          <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-tight sm:text-6xl">
            使うほど、
            <br className="hidden sm:block" />
            手に馴染む道具を。
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/75">
            西陣の町家で、筆記・裁断・計測・収納の道具を扱っています。新品の状態が一番いい道具ではなく、
            十年使ったときに一番いい道具を置くことにしています。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="border border-brass bg-brass px-6 py-3 text-sm font-medium text-blueprint-deep transition-colors hover:bg-transparent hover:text-brass"
            >
              道具を見る
            </Link>
            <Link
              href="/about"
              className="border border-paper/30 px-6 py-3 text-sm text-paper/80 transition-colors hover:border-paper hover:text-paper"
            >
              工房のこと
            </Link>
          </div>

          <dl className="mt-16 grid max-w-2xl grid-cols-3 gap-px border border-paper/15 bg-paper/15 font-mono text-[11px] uppercase tracking-[0.16em]">
            {[
              { term: "取扱", value: "8 点" },
              { term: "製造", value: "国内" },
              { term: "研ぎ直し", value: "無期限" },
            ].map((item) => (
              <div key={item.term} className="bg-blueprint px-4 py-4">
                <dt className="text-paper/50">{item.term}</dt>
                <dd className="mt-1.5 text-sm text-paper">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">三つの約束</h2>

        <ul className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-3">
          {promises.map((promise) => (
            <li key={promise.title} className="bg-paper p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brass">
                {promise.label}
              </p>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{promise.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-graphite">{promise.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-rule bg-paper-sunk">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">今月の道具</h2>
            <Link href="/products" className="text-sm text-brass hover:underline">
              すべての道具を見る →
            </Link>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <li key={product.id} className="flex">
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
