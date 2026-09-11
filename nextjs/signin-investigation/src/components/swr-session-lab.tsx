"use client";

import { useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  useSwrAuthSessionByPath,
  useSwrAuthSessionScoped,
  type SwrAuthSessionResult,
} from "@/hooks/use-swr-auth-session";
import { PageScopedSwrCache } from "@/providers/page-scoped-swr-cache";

export function SwrSessionLab() {
  return (
    <div className="space-y-10">
      <Panel
        title="版A：キャッシュキーにパスを含める"
        note='useSWR(["auth/session", pathname])。キャッシュは SWR の global に残ります。'
        result={useSwrAuthSessionByPath()}
      />

      {/* 版B だけ、独立したキャッシュの内側に置きます。 */}
      <PageScopedSwrCache>
        <ScopedPanel />
      </PageScopedSwrCache>

      <OwnPanel />
    </div>
  );
}

function ScopedPanel() {
  return (
    <Panel
      title="版B：ページごとに新しいキャッシュを与える"
      note='SWRConfig に provider: () => new Map() を渡し、key={pathname} で作り直します。'
      result={useSwrAuthSessionScoped()}
    />
  );
}

/** 比較対象。いま採用している自前の仕組み。 */
function OwnPanel() {
  const { session, isLoading, error } = useAuthSession();

  return (
    <Panel
      title="いまの自前版（比較用）"
      note="Context + useRef の Promise。ページのマウント単位で破棄されます。"
      result={{ session: session ?? undefined, isLoading, isValidating: false, error }}
    />
  );
}

function Panel({
  title,
  note,
  result,
}: {
  title: string;
  note: string;
  result: SwrAuthSessionResult;
}) {
  const { session, isLoading, isValidating } = result;

  // このコンポーネントが最初に描画された瞬間の値を、そのまま残します。
  const [firstRender] = useState(() => ({
    isLoading,
    hasData: session !== undefined,
    signedIn: Boolean(session?.tokens),
  }));

  const rows = [
    { term: "初回レンダーの isLoading", value: String(firstRender.isLoading) },
    { term: "初回レンダーのデータ", value: firstRender.hasData ? "あり（キャッシュ）" : "なし" },
    {
      term: "初回レンダーのログイン状態",
      value: firstRender.hasData ? (firstRender.signedIn ? "ログイン済み" : "未ログイン") : "—",
    },
    { term: "いまの isLoading", value: String(isLoading) },
    { term: "いまの isValidating", value: String(isValidating) },
    {
      term: "いまのログイン状態",
      value: session === undefined ? "—" : session.tokens ? "ログイン済み" : "未ログイン",
    },
  ];

  // ご指摘の症状：キャッシュがあるので待たずに、しかも古い値を返してしまう状態。
  const showsStale = !firstRender.isLoading && firstRender.hasData && !firstRender.signedIn;

  return (
    <section className="border border-rule">
      <div className="border-b border-rule bg-paper-sunk px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="mt-1.5 font-mono text-[10px] leading-relaxed tracking-wide text-graphite">
          {note}
        </p>
      </div>

      <dl className="font-mono text-sm">
        {rows.map((row, index) => (
          <div
            key={row.term}
            className={`flex flex-col gap-1 px-5 py-2.5 sm:flex-row sm:gap-6 ${
              index > 0 ? "border-t border-rule" : ""
            }`}
          >
            <dt className="w-64 shrink-0 text-[11px] uppercase tracking-widest text-graphite">
              {row.term}
            </dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>

      {showsStale && (
        <p className="border-t border-brass bg-brass/10 px-5 py-3 text-sm">
          初回レンダーで待たずに「未ログイン」を返しました。古いキャッシュです。
        </p>
      )}
    </section>
  );
}
