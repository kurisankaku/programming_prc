import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "工房",
  description: "京都・西陣の道具屋、工具 Kōgu の成り立ちと店舗案内です。",
};

const sections = [
  {
    label: "History",
    heading: "町家の一階から",
    body: [
      "二〇一四年、西陣の織屋建ての一階を借りて店を始めました。最初に置いたのは、祖父が使っていた小鋏を打った鍛冶屋の道具だけです。",
      "以来、作り手に会えたものから少しずつ増やしています。仕入れの基準は単純で、その道具を十年後も直せるかどうかです。",
    ],
  },
  {
    label: "Material",
    heading: "素材のこと",
    body: [
      "鋼は青紙と白紙、木は山桜・栓・真竹、金物は真鍮と鋳鉄。扱う素材を絞ることで、手入れの方法もひと通り説明できます。",
      "どの道具にも材質と寸法を明記しています。用途に対して大きすぎる道具は、よく切れても長くは使われないからです。",
    ],
  },
  {
    label: "Makers",
    heading: "作り手",
    body: [
      "鍛冶は福井、木地は滋賀、帆布は岡山の工房に頼んでいます。いずれも数人で回している規模なので、入荷は不定期です。",
      "研ぎ直しと修理は店で受け付け、必要なものは工房へ送ります。購入時期や購入店に関わらず相談してください。",
    ],
  },
];

const storeInfo = [
  { term: "住所", value: "京都市上京区西陣 1-4（サンプル）" },
  { term: "営業", value: "水—日 11:00 — 18:00" },
  { term: "定休", value: "月・火" },
  { term: "研ぎ直し", value: "店頭受付 / 二週間ほど" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">Workshop</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">工房のこと</h1>
        <p className="mt-4 text-base leading-relaxed text-graphite">
          道具を売るだけでなく、直して返すところまでを店の仕事だと考えています。
        </p>
      </header>

      <div className="mt-16 space-y-12">
        {sections.map((section) => (
          <section
            key={section.heading}
            className="grid gap-4 border-t border-rule pt-8 sm:grid-cols-[9rem_1fr] sm:gap-10"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
              {section.label}
            </p>
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-sm leading-relaxed text-graphite sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-16 border-t border-rule pt-8">
        <div className="grid gap-4 sm:grid-cols-[9rem_1fr] sm:gap-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">Visit</p>

          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">店舗案内</h2>

            <dl className="mt-6 border border-rule font-mono text-sm">
              {storeInfo.map((item, index) => (
                <div
                  key={item.term}
                  className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-6 ${
                    index > 0 ? "border-t border-rule" : ""
                  }`}
                >
                  <dt className="w-28 shrink-0 text-[11px] uppercase tracking-widest text-graphite">
                    {item.term}
                  </dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>

            <Link
              href="/products"
              className="mt-8 inline-block border border-blueprint bg-blueprint px-6 py-3 text-sm text-paper transition-colors hover:bg-blueprint-deep"
            >
              取扱いの道具を見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
