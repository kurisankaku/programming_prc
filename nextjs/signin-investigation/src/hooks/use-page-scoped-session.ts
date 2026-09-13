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
const settle = (promise: Promise<AuthSession>): Promise<State> =>
  promise.then(
    (session) => ({ session, error: null, isFetching: false }),
    (error: unknown) => ({ session: null, error, isFetching: false }),
  );

/**
 * 認証状態を、このフックが生きているあいだだけ保持します。
 * アンマウントすれば取得結果ごと消えるので、次のマウントでは取り直します。
 */
export function usePageScopedSession(): AuthSessionResult {
  const [{ session, error, isFetching }, setState] = useState(initialState);

  // StrictMode は effect を 2 回走らせるので、取得を 1 本に保つ控えを置きます。
  const pending = useRef<Promise<AuthSession> | null>(null);

  // マウントしたら取りにいきます。呼び出し側は待つだけで済みます。
  useEffect(() => {
    pending.current ??= fetchAuthSession();
    settle(pending.current).then(setState);
  }, []);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, isFetching: true }));

    setState(await settle(fetchAuthSession()));
  }, []);

  return useMemo(
    () => ({
      session,
      error,
      // 手元に結果が無いときだけ true。取り直し中は isRefreshing で表します。
      isLoading: isFetching && session === null,
      isRefreshing: isFetching && session !== null,
      isSignedIn: Boolean(session?.tokens),
      refresh,
    }),
    [session, error, isFetching, refresh],
  );
}
