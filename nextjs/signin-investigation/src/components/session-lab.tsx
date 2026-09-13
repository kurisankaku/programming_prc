"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useAuthBadge } from "@/hooks/use-auth-effect-demo";
import { useAuthSession, useCurrentUser } from "@/hooks/use-auth-session";
import { resetAuthCounters, useAuthProbeStore } from "@/stores/auth-probe-store";

export function SessionLab() {
  // このページの計測をここから数え直します。
  // 描画の段階で走るので、取得を始める Provider の effect より先です。
  useState(() => {
    resetAuthCounters();
    return null;
  });

  return (
    <div className="space-y-12">
      <ProbePanel />
      <SessionSummary />
      <NestedDemo />
      <EffectDemo />
      <LateMountDemo />
    </div>
  );
}

/** 実験の計測値。ページをマウントし直すたびに 0 に戻ります。 */
function ProbePanel() {
  const consumers = useAuthProbeStore((state) => state.consumers);
  const fetchCalls = useAuthProbeStore((state) => state.fetchCalls);

  const rows = [
    { term: "useAuthSession() を呼んでいる箇所", value: consumers, note: "マウント中の数" },
    { term: "fetchAuthSession() の実行回数", value: fetchCalls, note: "= 通信回数" },
  ];

  return (
    <section className="blueprint-grid bg-blueprint text-paper">
      <div className="p-7 sm:p-9">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">Measurements</p>

        <dl className="mt-7 grid gap-px border border-paper/15 bg-paper/15 sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.term} className="bg-blueprint px-5 py-5">
              <dt className="text-xs leading-relaxed text-paper/60">{row.term}</dt>
              <dd className="mt-3 flex items-baseline gap-2">
                <span className="font-mono text-3xl">{row.value}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-paper/45">
                  {row.note}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-7 max-w-2xl text-sm leading-relaxed text-paper/70">
          左の数字がいくつであっても、右は 1 のままです。呼び出し側が増えても取得は増えません。
        </p>
      </div>
    </section>
  );
}

/** ページ直下からの呼び出し。 */
function SessionSummary() {
  const { session, isLoading, error, isSignedIn, refresh } = useAuthSession();

  const accessToken = session?.tokens?.accessToken;
  const expiresAt = accessToken
    ? new Date(accessToken.payload.exp * 1000).toLocaleTimeString("ja-JP")
    : null;

  const rows: { term: string; value: ReactNode }[] = [
    { term: "状態", value: isLoading ? "取得中" : isSignedIn ? "ログイン済み" : "未ログイン" },
    { term: "userSub", value: session?.userSub ?? "—" },
    { term: "identityId", value: session?.identityId ?? "—" },
    { term: "アクセストークン期限", value: expiresAt ?? "—" },
  ];

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">いまの認証状態</h2>
        <button type="button" onClick={() => void refresh()} className="text-sm text-brass hover:underline">
          キャッシュを捨てて取り直す
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-6 border-l-2 border-brass bg-paper-sunk px-4 py-3 text-sm">
          認証状態を取得できませんでした。
        </p>
      ) : (
        <dl className="mt-6 border border-rule font-mono text-sm">
          {rows.map((row, index) => (
            <div
              key={row.term}
              className={`flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-6 ${
                index > 0 ? "border-t border-rule" : ""
              }`}
            >
              <dt className="w-52 shrink-0 text-[11px] uppercase tracking-widest text-graphite">
                {row.term}
              </dt>
              <dd className="break-all">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {!isLoading && !isSignedIn && (
        <p className="mt-6 text-sm leading-relaxed text-graphite">
          <Link href="/signin" className="text-brass hover:underline">
            ログイン
          </Link>
          すると、同じ仕組みでトークン付きのセッションが返ります。
        </p>
      )}
    </section>
  );
}

/**
 * 入れ子の実演。各階層が親から何も受け取らずに認証状態を取っています。
 * 深さも順番も関係なく、返るのはすべて同じ 1 回の取得結果です。
 */
function NestedDemo() {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">入れ子からの呼び出し</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-graphite">
        いずれの階層も props を受け取っていません。最も深い階層は useAuthSession()
        を内側で呼ぶ別のフック（useCurrentUser）を使っています。
      </p>

      <div className="mt-6">
        <Depth label="親コンポーネント">
          <Depth label="子コンポーネント">
            <Depth label="孫コンポーネント">
              <LeafViaNestedHook />
            </Depth>
          </Depth>
        </Depth>
      </div>
    </section>
  );
}

function Depth({ label, children }: { label: string; children: ReactNode }) {
  const { session, isLoading, isSignedIn } = useAuthSession();

  return (
    <div className="border border-rule p-4">
      <Readout
        label={label}
        source="useAuthSession()"
        value={isLoading ? "取得中" : isSignedIn ? (session?.userSub ?? "") : "未ログイン"}
      />
      <div className="mt-4">{children}</div>
    </div>
  );
}

function LeafViaNestedHook() {
  const { user, isLoading } = useCurrentUser();

  return (
    <div className="border border-brass/40 bg-paper-sunk p-4">
      <Readout
        label="最深部のフック"
        source="useCurrentUser() → useAuthSession()"
        value={isLoading ? "取得中" : (user?.email ?? "未ログイン")}
      />
    </div>
  );
}

/**
 * 3 段ネストしたカスタムフックの最深部で、useEffect から認証状態を使う実演。
 * コンポーネントは useAuthBadge() を呼ぶだけで、props は渡していません。
 */
function EffectDemo() {
  const { settled, awaited } = useAuthBadge();

  const rows = [
    {
      label: "宣言的",
      source: "useEffect が isLoading を見る",
      log: settled,
    },
    {
      label: "命令的",
      source: "useEffect の中で await getAuthSession()",
      log: awaited,
    },
  ];

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        ネストしたフックの useEffect から
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-graphite">
        useAuthBadge() → useAuthAudit() → 最深部のフック、と 3 段重なっています。
        useAuthSession() はフックなので各フックの先頭で呼び、useEffect
        の中ではその結果、または getAuthSession() を使います。
      </p>

      <ul className="mt-6 space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border border-rule p-4"
          >
            <div>
              <p className="text-sm font-semibold">{row.label}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-brass">
                {row.source}
              </p>
            </div>
            <p className="break-all text-right font-mono text-xs text-graphite">
              <span className="text-ink">effect {row.log.runs} 回</span>
              {row.log.entries.length > 0 && (
                <>
                  <br />
                  {row.log.entries.join(" / ")}
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * 取得が終わったあとに現れる呼び出し側。
 * 通信は起きず、最初の描画からすでに認証状態を持っています。
 */
function LateMountDemo() {
  const [count, setCount] = useState(0);

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">あとから増やす</h2>
        <button
          type="button"
          onClick={() => setCount((current) => current + 1)}
          className="text-sm text-brass hover:underline"
        >
          呼び出し箇所を増やす
        </button>
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-graphite">
        取得が終わったあとに増やしても、通信は増えません。上の
        「fetchAuthSession() の実行回数」が 1 のままであることと、
        追加された行が最初から取得済みであることを見てください。
      </p>

      {count === 0 ? (
        <p className="mt-6 border border-dashed border-rule px-6 py-10 text-center text-sm text-graphite">
          まだ増やしていません
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {Array.from({ length: count }, (_, index) => (
            <li key={index}>
              <LateConsumer index={index + 1} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function LateConsumer({ index }: { index: number }) {
  const { session, isLoading, isSignedIn } = useAuthSession();

  // 最初の描画の時点で取得済みだったかどうかを、そのまま残します。
  const [wasReadyOnMount] = useState(!isLoading);

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border border-rule p-4">
      <div>
        <p className="text-sm font-semibold">{index} 個目の呼び出し</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-brass">
          {wasReadyOnMount ? "マウント直後から取得済み" : "マウント時は取得中だった"}
        </p>
      </div>
      <p className="break-all font-mono text-xs text-graphite">
        {isLoading ? "取得中" : isSignedIn ? (session?.userSub ?? "") : "未ログイン"}
      </p>
    </div>
  );
}

function Readout({ label, source, value }: { label: string; source: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-brass">{source}</p>
      </div>
      <p className="break-all font-mono text-xs text-graphite">{value}</p>
    </div>
  );
}
