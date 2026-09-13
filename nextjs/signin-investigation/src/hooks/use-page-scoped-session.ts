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

/**
 * 結果を使わない呼び出しのための受け皿。
 *
 * 失敗はすでに state に入っていて画面から読めるので、ここで受け取る必要はありません。
 * ただし誰も受け取らないと未処理の rejection になるため、明示的に捨てています。
 */
const alreadyHandled = () => {};

/**
 * 認証状態を、このフックが生きているあいだだけ保持します。
 *
 * 取得は 1 回だけ走り、以降は何度呼ばれても同じ Promise を返します。
 * アンマウントすれば ref ごと消えるので、次のマウントでは必ず取り直します。
 */
export function usePageScopedSession(): AuthSessionResult {
  const [{ session, error, isFetching }, setState] = useState(initialState);

  // 進行中、または解決済みの取得。全員がこれ 1 本を共有します。
  const pending = useRef<Promise<AuthSession> | null>(null);

  const getAuthSession = useCallback((): Promise<AuthSession> => {
    async function fetchAndStore(): Promise<AuthSession> {
      try {
        const session = await fetchAuthSession();
        setState({ session, error: null, isFetching: false });
        return session;
      } catch (error) {
        setState({ session: null, error, isFetching: false });
        throw error;
      }
    }

    // 2 人目以降はこの Promise に相乗りします。解決済みなら即座に返ります。
    // await を挟まないのは、ここでやるのが Promise の手渡しだけだからです。
    pending.current ??= fetchAndStore();
    return pending.current;
  }, []);

  const refresh = useCallback(async () => {
    pending.current = null;
    setState((current) => ({ ...current, isFetching: true }));

    await getAuthSession().catch(alreadyHandled);
  }, [getAuthSession]);

  // マウントしたら取りにいきます。呼び出し側は待つだけで済みます。
  useEffect(() => {
    void getAuthSession().catch(alreadyHandled);
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
