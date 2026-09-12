import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SwrSessionLab } from "@/components/swr-session-lab";

export const metadata: Metadata = {
  title: "SWR 版の比較",
  description: "認証状態のキャッシュを SWR で作れるかを、二つの方式で確かめます。",
};

export default function SwrSessionPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">Comparison</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">SWR 版の比較</h1>
        <p className="mt-4 text-base leading-relaxed text-graphite">
          「ページ遷移のたびに、必ず一度は isLoading が true になる」を SWR で満たせるかを見ます。
        </p>

        <ol className="mt-6 space-y-2 text-sm leading-relaxed text-graphite">
          <li>
            1. 未ログインのままこのページを開く（版A のキャッシュに「未ログイン」が入ります）
          </li>
          <li>
            2.{" "}
            <Link href="/signin" className="text-brass hover:underline">
              ログイン
            </Link>{" "}
            する
          </li>
          <li>3. このページに戻り、各版の「初回レンダー」の行を見る</li>
        </ol>

        <p className="mt-4 text-sm leading-relaxed text-graphite">
          手順 2 と 3 は、必ず画面内のリンクで移動してください。
          再読み込みすると SWR の global キャッシュごと消えてしまいます。
        </p>
      </header>

      <div className="mt-12">
        {/* SwrSessionLab は ?only= を読むため、静的プリレンダリングには境界が要ります。 */}
        <Suspense fallback={<p className="text-sm text-graphite">読み込み中</p>}>
          <SwrSessionLab />
        </Suspense>
      </div>
    </div>
  );
}
