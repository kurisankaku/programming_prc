"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSessionLoader } from "@/lib/auth/session-loader";
import type { AuthSession } from "@/lib/amplify-mock/types";
import type { AuthSessionResult } from "@/types/auth-session-result";

type State = {
  session: AuthSession | null;
  error: unknown;
  isFetching: boolean;
};

// マウントした時点で取りにいくので、最初から取得中です。
const initialState: State = { session: null, error: null, isFetching: true };

/**
 * 認証状態を、このフックが生きているあいだだけ保持します。
 * アンマウントすれば loader ごと消えるので、次のマウントでは取り直します。
 */
export function usePageScopedSession(): AuthSessionResult {
  const [loader] = useState(createSessionLoader);
  const [{ session, error, isFetching }, setState] = useState(initialState);

  /** 取得して、描画できる形に整えます。成功も失敗もここで State になります。 */
  const load = useCallback(
    (): Promise<State> =>
      loader.load().then(
        (session) => ({ session, error: null, isFetching: false }),
        (error: unknown) => ({ session: null, error, isFetching: false }),
      ),
    [loader],
  );

  // マウントしたら取りにいきます。呼び出し側は待つだけで済みます。
  useEffect(() => {
    load().then(setState);
  }, [load]);

  const refresh = useCallback(async () => {
    loader.reset();
    setState((current) => ({ ...current, isFetching: true }));

    setState(await load());
  }, [loader, load]);

  return useMemo(
    () => ({
      session,
      error,
      // 手元に結果が無いときだけ true。取り直し中は isRefreshing で表します。
      isLoading: isFetching && session === null,
      isRefreshing: isFetching && session !== null,
      isSignedIn: Boolean(session?.tokens),
      getAuthSession: loader.load,
      refresh,
    }),
    [session, error, isFetching, loader, refresh],
  );
}
