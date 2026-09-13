"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useAuthSession, useCurrentUser } from "@/hooks/use-auth-session";

/** 認証状態の実験。ページ単位のキャッシュが効いていることを画面で確かめる。 */
export function SessionLab() {
  return (
    <div className="space-y-12">
      <SessionSummary />
      <NestedDemo />
      <LateMountDemo />
    </div>
  );
}

/** いま保持している認証状態と、取り直しの操作。 */
function SessionSummary() {
  const { session, isLoading, error, isSignedIn, refresh } = useAuthSession();

  const accessToken = session?.tokens?.accessToken;
  const expiresAt = accessToken
    ? new Date(accessToken.payload.exp * 1000).toLocaleTimeString("ja-JP")
    : null;

  const rows: { term: string; value: ReactNode }[] = [
    {
      term: "状態",
      value: isLoading ? "取得中" : isSignedIn ? "ログイン済み" : "未ログイン",
    },
    { term: "userSub", value: session?.userSub ?? "—" },
    { term: "identityId", value: session?.identityId ?? "—" },
    { term: "アクセストークン期限", value: expiresAt ?? "—" },
  ];

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">いまの認証状態</h2>
        <button
          type="button"
          onClick={() => void refresh()}
          // 取得中に押せると 2 本が重なり、先に始めた方が後から着いて上書きし得る。
          disabled={isLoading}
          className="text-sm text-brass hover:underline disabled:opacity-50"
        >
          {isLoading ? "取得中" : "キャッシュを捨てて取り直す"}
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

/** 各階層が親から何も受け取らずに、同じ取得結果を得ていることの実演。 */
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

/** 入れ子の 1 階層。自分で useAuthSession() を呼んで表示する。 */
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

/** 最深部。useAuthSession() を内側で呼ぶ別のフックを経由する。 */
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

/** 取得が終わったあとに呼び出し側を増やしても、通信が増えないことの実演。 */
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
        取得が終わったあとに増やしても、通信は増えません。追加された行が
        最初の描画から取得済みであることと、DevTools の Network が動かないことを見てください。
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

/** あとから現れた呼び出し側。マウント時点で取得済みかを記録する。 */
function LateConsumer({ index }: { index: number }) {
  const { session, isLoading, isSignedIn } = useAuthSession();

  // 最初の描画の時点で取得済みだったかどうかを、そのまま残す。
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

/** 呼び出し元と、そこで得られた値の 1 行表示。 */
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
