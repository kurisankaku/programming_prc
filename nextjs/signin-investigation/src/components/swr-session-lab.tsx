"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useSwrAuthSession, useSwrAuthSessionByPath } from "@/hooks/use-swr-auth-session";
import { SwrBoundaryDemo } from "@/components/swr-boundary-demo";
import { PageScopedSwrCache } from "@/providers/page-scoped-swr-cache";
import type { AuthSessionResult } from "@/types/auth-session-result";

/**
 * 通信回数を数えたいときは ?only=a / ?only=b / ?only=own で 1 方式だけ描画します。
 * 三つ同時だと、それぞれの通信が同時に飛んで数が混ざるためです。
 */
export function SwrSessionLab() {
  const only = useSearchParams().get("only");
  const shows = (name: string) => !only || only === name;

  return (
    <div className="space-y-10">
      <RequestCounter />

      {shows("a") && <ByPathPanel />}

      {/* SWR 版は、ページごとに作り直されるキャッシュの内側でのみ成立します。 */}
      {shows("b") && (
        <PageScopedSwrCache>
          <SwrPanel />
        </PageScopedSwrCache>
      )}

      {shows("own") && <OwnPanel />}

      {shows("boundary") && <SwrBoundaryDemo />}
    </div>
  );
}

/** このページに来てからの /api/auth/session の通信回数。 */
function RequestCounter() {
  const [baseline] = useState(() => countSessionRequests());
  const [current, setCurrent] = useState(baseline);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(countSessionRequests()), 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="border border-brass bg-brass/10 px-5 py-3 font-mono text-sm">
      このページでの /api/auth/session 通信回数: {current - baseline}
    </p>
  );
}

function countSessionRequests(): number {
  if (typeof performance === "undefined") return 0;

  return performance
    .getEntriesByType("resource")
    .filter((entry) => entry.name.includes("/api/auth/session")).length;
}

function ByPathPanel() {
  return (
    <Panel
      title="版A：キャッシュキーにパスを含める"
      note='useSWR(["auth/session", pathname])。キャッシュは SWR の global に残ります。'
      result={useSwrAuthSessionByPath()}
      imperative={null}
    />
  );
}

function SwrPanel() {
  const result = useSwrAuthSession();
  const imperative = useImperativeProbe(result);

  return (
    <Panel
      title="版B：SWR ＋ ページごとの新しいキャッシュ"
      note="SWRConfig の provider を差し替え、key={pathname} で作り直します。"
      result={result}
      imperative={imperative}
    />
  );
}

function OwnPanel() {
  const result = useAuthSession();
  const imperative = useImperativeProbe(result);

  return (
    <Panel
      title="Context 版（現行）"
      note="Context + useRef の Promise。ページのマウント単位で破棄されます。"
      result={result}
      imperative={imperative}
    />
  );
}

/**
 * マウント直後に useEffect から getAuthSession() を呼び、
 * 余計な通信が増えないかを見ます。
 */
function useImperativeProbe(result: AuthSessionResult): string {
  const { getAuthSession } = result;
  const [outcome, setOutcome] = useState("待機中");

  useEffect(() => {
    let active = true;
    const before = countSessionRequests();

    getAuthSession()
      .then((session) => {
        if (!active) return;
        const added = countSessionRequests() - before;
        setOutcome(
          `${session.tokens ? "ログイン済み" : "未ログイン"} / この取得で増えた通信 ${added} 件`,
        );
      })
      .catch(() => {
        if (active) setOutcome("取得に失敗");
      });

    return () => {
      active = false;
    };
  }, [getAuthSession]);

  return outcome;
}

function Panel({
  title,
  note,
  result,
  imperative,
}: {
  title: string;
  note: string;
  result: AuthSessionResult;
  imperative: string | null;
}) {
  const { session, isLoading, isRefreshing } = result;

  // このコンポーネントが最初に描画された瞬間の値を、そのまま残します。
  const [firstRender] = useState(() => ({
    isLoading,
    hasData: session !== null,
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
    { term: "いまの isRefreshing", value: String(isRefreshing) },
    {
      term: "いまのログイン状態",
      value: session === null ? "—" : session.tokens ? "ログイン済み" : "未ログイン",
    },
    ...(imperative
      ? [{ term: "useEffect 内の getAuthSession()", value: imperative }]
      : []),
  ];

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
