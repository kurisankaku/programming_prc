import type { Metadata } from "next";
import Link from "next/link";
import { SessionLab } from "@/components/session-lab";

export const metadata: Metadata = {
  title: "認証状態の実験",
  description:
    "fetchAuthSession() を何度呼んでも、ページごとに一度しか取得しないことを確かめます。",
};

export default function SessionPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">Experiment</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">認証状態の実験</h1>
        <p className="mt-4 text-base leading-relaxed text-graphite">
          このページでは、ヘッダーを含む複数の箇所が useAuthSession() を呼んでいます。
          それでも fetchAuthSession() が走るのはページごとに一度だけです。
        </p>
        <p className="mt-4 text-base leading-relaxed text-graphite">
          <Link href="/products" className="text-brass hover:underline">
            道具
          </Link>
          などへ移動して戻ると、ページが作り直されるのでもう一度だけ取得が走ります。
        </p>
      </header>

      <div className="mt-12">
        <SessionLab />
      </div>
    </div>
  );
}
