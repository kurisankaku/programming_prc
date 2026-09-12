"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";
import { PageScopedSwrCache } from "@/providers/page-scoped-swr-cache";

/**
 * 「配下だけ独立」の確認。
 *
 * まったく同じキー "auth/session" を、境界の外と内で 1 回ずつ使います。
 * キャッシュが共有なら取得は 1 回、別物なら 2 回になります。
 */
export function SwrBoundaryDemo() {
  return (
    <section className="border border-rule">
      <div className="border-b border-rule bg-paper-sunk px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          同じキーでも、境界の内と外は別物
        </h2>
        <p className="mt-1.5 font-mono text-[10px] leading-relaxed tracking-wide text-graphite">
          どちらの行も useSWR(&quot;auth/session&quot;)。キーは完全に同じです。
        </p>
      </div>

      <Row label="境界の外" note="SWR の global キャッシュ" />

      <PageScopedSwrCache>
        <Row label="境界の内" note="SWRConfig の provider が作ったページ専用キャッシュ" />
      </PageScopedSwrCache>

      <p className="border-t border-rule px-5 py-3 text-sm leading-relaxed text-graphite">
        同じキーなのに両方が 1 回ずつ取得していれば、キャッシュは共有されていません。
        SWR に移行するなら、ヘッダーも含めて認証を使う全員を境界の内側に入れる必要があります。
      </p>
    </section>
  );
}

function Row({ label, note }: { label: string; note: string }) {
  const [fetches, setFetches] = useState(0);

  const { data, isLoading } = useSWR<AuthSession>(
    "auth/session",
    async () => {
      const session = await fetchAuthSession();
      // フェッチャーの中なので、描画中でも効果の中でもありません。
      setFetches((current) => current + 1);
      return session;
    },
    { keepPreviousData: false, revalidateOnFocus: false },
  );

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-rule px-5 py-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-brass">{note}</p>
      </div>
      <p className="font-mono text-sm">
        この行の取得 {fetches} 回
        <span className="ml-3 text-graphite">
          {isLoading ? "取得中" : data?.tokens ? "ログイン済み" : "未ログイン"}
        </span>
      </p>
    </div>
  );
}
