"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { fetchAuthSession } from "@/lib/amplify-mock/auth";
import type { AuthSession } from "@/lib/amplify-mock/types";

export type AuthSessionContextValue = {
  session: AuthSession | null;
  error: unknown;
  /** 取得が進行中かどうか。初回か取り直しかは session の有無で見分けます。 */
  isFetching: boolean;
  /**
   * 認証状態を取ります。取得済みなら通信は起きず、
   * 解決済みの Promise がそのまま返ります。失敗すれば reject します。
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
  session: AuthSession | null;
  error: unknown;
  isFetching: boolean;
};

// ページを開いた時点で取りにいくので、最初から取得中です。
const initialState: State = { session: null, error: null, isFetching: true };

/** 取得して結果を state に書きます。失敗も state に残したうえで投げ直します。 */
async function fetchAndStore(
  setState: Dispatch<SetStateAction<State>>,
): Promise<AuthSession> {
  try {
    const session = await fetchAuthSession();
    setState({ session, error: null, isFetching: false });
    return session;
  } catch (error) {
    setState({ session: null, error, isFetching: false });
    throw error;
  }
}

/**
 * 結果を使わない呼び出しのための受け皿。
 *
 * 失敗はすでに state に入っていて画面から読めるので、ここで受け取る必要はありません。
 * ただし誰も受け取らないと未処理の rejection になるため、明示的に捨てています。
 */
const alreadyHandled = () => {};

function PageAuthSession({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);

  // このページで進行中、または解決済みの取得。
  // ref なのでアンマウントと同時に消え、次のマウントでは必ず取り直します。
  const pending = useRef<Promise<AuthSession> | null>(null);

  // await を挟まないのは、ここでやるのが「取得中の Promise を手渡す」ことだけだからです。
  // 2 人目以降はその Promise に相乗りし、解決済みなら即座に受け取ります。
  const getAuthSession = useCallback((): Promise<AuthSession> => {
    pending.current ??= fetchAndStore(setState);
    return pending.current;
  }, []);

  const refresh = useCallback(async () => {
    pending.current = null;
    setState((current) => ({ ...current, isFetching: true }));

    await getAuthSession().catch(alreadyHandled);
  }, [getAuthSession]);

  // ページを開いたら取りにいきます。呼び出し側は待つだけで済みます。
  useEffect(() => {
    void getAuthSession().catch(alreadyHandled);
  }, [getAuthSession]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({ ...state, getAuthSession, refresh }),
    [state, getAuthSession, refresh],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}
