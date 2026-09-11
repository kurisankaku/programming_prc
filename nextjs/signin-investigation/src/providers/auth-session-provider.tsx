"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";
import { countLoad, resetAuthCounters } from "@/stores/auth-probe-store";

export type AuthSessionStatus = "idle" | "loading" | "success" | "error";

export type AuthSessionContextValue = {
  status: AuthSessionStatus;
  session: AuthSession | null;
  error: unknown;
  /** 呼び出し側の登録。実際の取得はページで一度きりです。 */
  load: () => void;
  /**
   * useEffect やイベントハンドラの中から、命令的に認証状態を取ります。
   * 取得済みなら通信は起きず、解決済みの Promise がそのまま返ります。
   */
  getAuthSession: () => Promise<AuthSession>;
  /** キャッシュを捨てて取り直します。ログイン直後などに使います。 */
  refresh: () => Promise<void>;
};

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

/**
 * 認証状態のキャッシュ境界。
 *
 * パスが変わると key が変わって下の PageAuthSession が丸ごと作り直され、
 * 保持していた Promise も結果も破棄されます。つまりキャッシュの寿命は
 * 「このページがマウントされている間」です。
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return <PageAuthSession key={pathname}>{children}</PageAuthSession>;
}

type State = {
  status: AuthSessionStatus;
  session: AuthSession | null;
  error: unknown;
};

const initialState: State = { status: "idle", session: null, error: null };

function PageAuthSession({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  // このページで進行中、または解決済みの取得。
  // ref なのでアンマウントと同時に消え、次のマウントでは必ず取り直します。
  const pending = useRef<Promise<AuthSession> | null>(null);

  // このページで最初に取得を始めたときに、計測を数え直します。
  const countersReset = useRef(false);

  const start = useCallback((): Promise<AuthSession> => {
    if (!countersReset.current) {
      countersReset.current = true;
      resetAuthCounters();
    }

    // 2 人目以降の呼び出しは、進行中の Promise にそのまま相乗りします。
    // 解決済みならその Promise は即座に返るので、通信は起きません。
    if (pending.current) return pending.current;

    countLoad();
    setState((current) => ({ ...current, status: "loading" }));

    pending.current = fetchAuthSession()
      .then((session) => {
        setState({ status: "success", session, error: null });
        return session;
      })
      .catch((error: unknown) => {
        setState({ status: "error", session: null, error });
        throw error;
      });

    return pending.current;
  }, []);

  // フックの登録用。失敗は state に入っているので、ここでは投げ直しません。
  const load = useCallback(() => {
    void start().catch(() => {});
  }, [start]);

  // 命令的な取得用。失敗は呼び出し側で catch できます。
  const getAuthSession = useCallback(() => start(), [start]);

  const refresh = useCallback(async () => {
    pending.current = null;
    await start().catch(() => {});
  }, [start]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({ ...state, load, getAuthSession, refresh }),
    [state, load, getAuthSession, refresh],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}
