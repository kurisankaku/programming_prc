"use client";

import { useContext, useEffect } from "react";
import { AuthSessionContext } from "@/providers/auth-session-provider";
import type { AuthSession } from "@/lib/amplify-mock/types";
import { registerConsumer } from "@/stores/auth-probe-store";

export type UseAuthSessionResult = {
  session: AuthSession | null;
  isLoading: boolean;
  error: unknown;
  isSignedIn: boolean;
  /**
   * useEffect やイベントハンドラの中から取りたいときに使います。
   * 参照は不変なので、依存配列に入れても効果が繰り返し走ることはありません。
   */
  getAuthSession: () => Promise<AuthSession>;
  refresh: () => Promise<void>;
};

/**
 * 認証状態の取得口。
 *
 * どのコンポーネント・どのフックから、何度呼んでも構いません。
 * 親から状態を受け取る必要はなく、ネストの深さも関係ありません。
 * 実際の取得はページごとに一度だけで、2 人目以降はその結果を共有します。
 */
export function useAuthSession(): UseAuthSessionResult {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession は AuthSessionProvider の内側で呼んでください。");
  }

  const { status, session, error, load, getAuthSession, refresh } = context;

  useEffect(() => {
    void load();
    return registerConsumer();
  }, [load]);

  return {
    session,
    isLoading: status === "idle" || status === "loading",
    error,
    isSignedIn: Boolean(session?.tokens),
    getAuthSession,
    refresh,
  };
}

/**
 * useAuthSession を内側で呼ぶだけのフック。
 * フックがネストしても、呼び出し側は何も引き渡さなくて済むことの例です。
 */
export function useCurrentUser() {
  const { session, isLoading, error } = useAuthSession();
  const payload = session?.tokens?.idToken?.payload;

  return {
    isLoading,
    error,
    user: payload ? { userId: payload.sub, email: payload.email ?? "" } : null,
  };
}
