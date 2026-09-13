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

/** 成否をまとめて State に畳みます。返る Promise は reject しません。 */
async function settle(promise: Promise<AuthSession>): Promise<State> {
  try {
    return { session: await promise, error: null, isFetching: false };
  } catch (error) {
    return { session: null, error, isFetching: false };
  }
}

/** 認証状態を、このフックが生きているあいだだけ保持します。 */
export function usePageScopedSession(): AuthSessionResult {
  const [{ session, error, isFetching }, setState] = useState(initialState);

  // StrictMode は effect を 2 回走らせるので、取得を 1 本に保つ控えを置きます。
  const pending = useRef<Promise<AuthSession> | null>(null);

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
      isLoading: isFetching && session === null,
      isRefreshing: isFetching && session !== null,
      isSignedIn: Boolean(session?.tokens),
      refresh,
    }),
    [session, error, isFetching, refresh],
  );
}
