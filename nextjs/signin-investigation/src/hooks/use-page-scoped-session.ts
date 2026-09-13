"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";
import type { AuthSessionResult } from "@/types/auth-session-result";

type State = {
  session: AuthSession | null;
  error: unknown;
  isFetching: boolean;
};

// マウントした時点で取りにいくので、最初から取得中です。
const initialState: State = { session: null, error: null, isFetching: true };

/** 取得の成否を、そのまま描画できる形に畳みます。返る Promise は reject しません。 */
async function settle(promise: Promise<AuthSession>): Promise<State> {
  try {
    return { session: await promise, error: null, isFetching: false };
  } catch (error) {
    return { session: null, error, isFetching: false };
  }
}

/**
 * 認証状態を、このフックが生きているあいだだけ保持します。
 * アンマウントすれば ref ごと消えるので、次のマウントでは取り直します。
 */
export function usePageScopedSession(): AuthSessionResult {
  const [{ session, error, isFetching }, setState] = useState(initialState);

  // このマウントで進行中、または解決済みの取得。
  const pending = useRef<Promise<AuthSession> | null>(null);

  /**
   * 取得を 1 本に保ちます。2 人目以降は同じ Promise を受け取るので、
   * 解決前なら相乗りし、解決済みなら待たずに値を受け取ります。
   *
   * 参照を固定するのは、呼び出し側が依存配列に入れられるようにするためです。
   * 固定しないと、下の useEffect も毎描画で走り直します。
   */
  const getAuthSession = useCallback((): Promise<AuthSession> => {
    pending.current ??= fetchAuthSession();
    return pending.current;
  }, []);

  // マウントしたら取りにいきます。呼び出し側は待つだけで済みます。
  useEffect(() => {
    // useEffect のコールバックは async にできない（戻り値はクリーンアップ関数）ので包みます。
    void (async () => {
      setState(await settle(getAuthSession()));
    })();
  }, [getAuthSession]);

  const refresh = useCallback(async () => {
    pending.current = null;
    setState((current) => ({ ...current, isFetching: true }));

    setState(await settle(getAuthSession()));
  }, [getAuthSession]);

  return useMemo(
    () => ({
      session,
      error,
      // 手元に結果が無いときだけ true。取り直し中は isRefreshing で表します。
      isLoading: isFetching && session === null,
      isRefreshing: isFetching && session !== null,
      isSignedIn: Boolean(session?.tokens),
      getAuthSession,
      refresh,
    }),
    [session, error, isFetching, getAuthSession, refresh],
  );
}
